import os
import re
import urllib.request
import urllib.parse
import time

DIRECTORY = r"c:\Users\pavle\Desktop\salsa_lab_v2\mambo_course"

def get_youtube_url(query):
    # known override
    if "spirit moves" in query.lower():
        return "https://www.youtube.com/watch?v=gucZIXHWXQo"
        
    query_string = urllib.parse.urlencode({"search_query": query})
    url = "https://www.youtube.com/results?" + query_string
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # YouTube often puts data in window["ytInitialData"]
        
        matches = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
        for m in matches:
            # simple exclusion of standard UI video ids or stuff, but usually the first is the best result
            return "https://www.youtube.com/watch?v=" + m
    except Exception as e:
        print(f"Error searching {query}: {e}")
    return "https://www.youtube.com/results?" + query_string

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match lines like: 🎬 [Search: The Spirit Moves Documentary](https://www.youtube.com/results?search_query=The+Spirit+Moves+Documentary) — Watch for the section...
    # We want to replace it with: 🎬 [The Spirit Moves Documentary](REAL_URL)
    # the regex looks for 🎬 \[Search: (.*?)\]\((.*?)\)(?: — (.*))?
    # but wait, it might be 🎬 [Search: ...]...
    
    def replacer(match):
        title = match.group(1)
        real_url = get_youtube_url(title)
        print(f"Replaced {title} -> {real_url}")
        time.sleep(0.5)
        return f"🎬 [{title}]({real_url})"

    new_content = re.sub(
        r'🎬 \[Search: ([^\]]+)\]\([^\)]+\)[^\n]*',
        replacer,
        content
    )
    
    # Just in case some lines don't say "Search:" but have descriptions
    # Wait, the user requested to remove the search_query links and remove descriptions.
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
            print(f"Updated {filepath}")

for i in range(1, 21):
    fp = os.path.join(DIRECTORY, f"module_{i}.md")
    if os.path.exists(fp):
        process_file(fp)
