export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.path}`,
  });
};
