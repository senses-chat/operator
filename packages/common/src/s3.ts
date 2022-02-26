export function getS3FileName(s3Path: string): string {
  return /(.+\/)?(.+)$/.test(s3Path) ? (/(.+\/)?(.+)$/.exec(s3Path)[2] || null)  : null;
}

export function getS3ObjectName(s3Path: string): string {
  return /s3:\/\/(.+?)\/(.+)/.test(s3Path) ? /s3:\/\/(.+?)\/(.+)/.exec(s3Path)[2] : s3Path;
}

export function getS3BucketName(s3Path: string): string {
  return /s3:\/\/(.+?)\/(.+)/.test(s3Path) ? /s3:\/\/(.+?)\/(.+)/.exec(s3Path)[1] : null;
}