import { verifyToken } from "../auth";

export function requireAuth(role?: string) {
  return (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "No token" });

      const decoded: any = verifyToken(token);
      if (role && decoded.role !== role) {
        return res.status(403).json({ error: "Forbidden" });
      }

      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };
}
