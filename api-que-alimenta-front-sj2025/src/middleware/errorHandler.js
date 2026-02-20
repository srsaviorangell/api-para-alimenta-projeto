function errorHandler(err, req, res, next) {
    console.error('❌ Error:', err.message);

    const status = err.status || 500;
    res.status(status).json({
        error: true,
        message: err.message || 'Erro interno do servidor.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = errorHandler;
