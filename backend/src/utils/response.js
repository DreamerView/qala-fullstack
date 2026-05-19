export function success(res, message = 'Success', data = null, statusCode = 200) {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  })
}

export function error(res, message = 'Error', statusCode = 400, errors = null) {
  return res.status(statusCode).json({
    status: false,
    message,
    errors,
  })
}