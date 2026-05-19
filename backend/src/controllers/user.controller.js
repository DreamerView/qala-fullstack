import { success } from '../utils/response.js'

export async function getCurrentUser(req, res) {
  return success(res, 'Current user', {
    user: req.user,
  })
}