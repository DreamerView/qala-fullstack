export default function errorMiddleware(err, req, res, next) {
  console.error(err)

  return res.status(err.statusCode || 500).json({
    status: false,
    message: err.message || 'Internal server error',
  })
}