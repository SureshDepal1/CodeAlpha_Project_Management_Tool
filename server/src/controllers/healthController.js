export const getHealth = (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'taskflow-api',
    timestamp: new Date().toISOString(),
  });
};
