"""READ-ONLY: audit Meta CAPI event quality.

Confirms two suspected root causes for the Events-Manager warnings:

  1. "All web StartTrial events sending the same price" — show value
     distribution for StartTrial rows in the last 30 days.
  2. "Improve PageView CAPI coverage" — show what fraction of PageView
     CAPI rows actually carry fbp / fbc / email-derivable user_data
     (these are the high-EMQ identifiers Meta uses for matching).

No mutations. Safe to run against prod.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
_ENV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    ".env",
)
load_dotenv(_ENV_PATH)

from sqlalchemy import text
from models import get_engine


def main():
    engine = get_engine()
    with engine.connect() as conn:
        # 1) StartTrial value variation
        st = conn.execute(text("""
            SELECT
                COALESCE(value::text, 'NULL') AS value,
                currency,
                COUNT(*) AS n
            FROM user_events
            WHERE event_name = 'StartTrial'
              AND created_at >= NOW() - INTERVAL '30 days'
            GROUP BY 1, 2
            ORDER BY n DESC
        """)).all()

        print("==== StartTrial value distribution (30d) ====")
        if not st:
            print("  (no StartTrial events in last 30 days)")
        for r in st:
            print(f"  value={r.value:<8}  currency={r.currency or '-':<4}  count={r.n}")

        # 2) PageView CAPI quality (anonymous fb match identifiers)
        pv = conn.execute(text("""
            SELECT
                COUNT(*)                                 AS total,
                COUNT(*) FILTER (WHERE fbp IS NOT NULL)  AS with_fbp,
                COUNT(*) FILTER (WHERE fbc IS NOT NULL)  AS with_fbc,
                COUNT(*) FILTER (WHERE user_id IS NOT NULL) AS with_user_id,
                COUNT(*) FILTER (WHERE client_ip IS NOT NULL) AS with_ip,
                COUNT(*) FILTER (WHERE user_agent IS NOT NULL) AS with_ua,
                COUNT(*) FILTER (WHERE capi_status = 'ok')    AS capi_ok,
                COUNT(*) FILTER (WHERE capi_status = 'error') AS capi_error,
                COUNT(*) FILTER (WHERE capi_status = 'skipped') AS capi_skipped,
                COUNT(*) FILTER (WHERE capi_status IS NULL)   AS capi_null
            FROM user_events
            WHERE event_name = 'PageView'
              AND created_at >= NOW() - INTERVAL '7 days'
        """)).first()

        print("\n==== PageView CAPI quality (last 7 days) ====")
        if pv and pv.total:
            t = pv.total
            def pct(x): return f"{(x or 0) * 100.0 / t:5.1f}%"
            print(f"  total PageView events:     {t}")
            print(f"  with fbp cookie:           {pv.with_fbp} ({pct(pv.with_fbp)})")
            print(f"  with fbc cookie:           {pv.with_fbc} ({pct(pv.with_fbc)})")
            print(f"  with user_id (logged in):  {pv.with_user_id} ({pct(pv.with_user_id)})")
            print(f"  with client_ip:            {pv.with_ip} ({pct(pv.with_ip)})")
            print(f"  with user_agent:           {pv.with_ua} ({pct(pv.with_ua)})")
            print()
            print(f"  capi_status=ok:            {pv.capi_ok} ({pct(pv.capi_ok)})")
            print(f"  capi_status=error:         {pv.capi_error} ({pct(pv.capi_error)})")
            print(f"  capi_status=skipped:       {pv.capi_skipped} ({pct(pv.capi_skipped)})")
            print(f"  capi_status=NULL:          {pv.capi_null} ({pct(pv.capi_null)})")
        else:
            print("  (no PageView events in last 7 days)")

        # 3) ALL event_names quality breakdown
        all_q = conn.execute(text("""
            SELECT
                event_name,
                COUNT(*) AS n,
                COUNT(*) FILTER (WHERE fbp IS NOT NULL)  AS with_fbp,
                COUNT(*) FILTER (WHERE fbc IS NOT NULL)  AS with_fbc,
                COUNT(*) FILTER (WHERE capi_status = 'ok')    AS capi_ok,
                COUNT(*) FILTER (WHERE capi_status = 'error') AS capi_error
            FROM user_events
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY event_name
            ORDER BY n DESC
        """)).all()

        print("\n==== All events: fbp/fbc + CAPI status (last 7 days) ====")
        for r in all_q:
            print(f"  {r.event_name:<24} n={r.n:<6} "
                  f"fbp={r.with_fbp:<5} fbc={r.with_fbc:<5} "
                  f"capi_ok={r.capi_ok:<5} capi_err={r.capi_error}")


if __name__ == "__main__":
    main()
