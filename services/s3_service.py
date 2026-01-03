import logging
from typing import Dict

import boto3
from botocore.exceptions import ClientError

from output.backend.config import settings

logger = logging.getLogger(__name__)

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

def generate_presigned_url(object_name: str, expiration: int = 3600) -> Dict[str, str]:
    """Generate a presigned URL to upload an S3 object

    :param object_name: S3 object name
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Dictionary with 'url' and 'fields' for POST upload, or None if error.
    """
    try:
        response = s3_client.generate_presigned_post(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=object_name,
            Fields=None, # Can specify conditions here, e.g., {'acl': 'public-read'}
            Conditions=None,
            ExpiresIn=expiration
        )
    except ClientError as e:
        logger.error(f"Error generating presigned URL: {e}")
        return {}
    
    return response