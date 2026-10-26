import type { Access, FieldAccess, PayloadRequest } from 'payload'

export function isAdminUser(req: PayloadRequest): boolean {
  return req.user?.collection === 'users' && req.user.role === 'admin'
}
export const adminOnly: Access = ({ req }) => isAdminUser(req)
export const adminField: FieldAccess = ({ req }) => isAdminUser(req)
export const publishedOrAdmin: Access = ({ req }) => {
  if (isAdminUser(req)) return true
  if (req.query?.draft === true || req.query?.draft === 'true') return false
  return { _status: { equals: 'published' } }
}
