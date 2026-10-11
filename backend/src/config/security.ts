export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET обязателен и должен содержать не менее 32 символов');
  }
  return secret;
}
