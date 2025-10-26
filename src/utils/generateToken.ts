import crypto from "crypto";

export const generateToken = () => {
  const token = crypto.randomBytes(30).toString('base64url').substring(0, 30);
  const tokenHash = hashToken(token);
  
  return {
    token,
    tokenHash
  };
}

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
}

