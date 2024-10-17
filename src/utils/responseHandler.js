// utils/responseHandler.js
const sendSuccessResponse = (res, data, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({
        status: "success",
        message,
        data,
    });
};

const sendErrorResponse = (res, error, statusCode = 500) => {
    res.status(statusCode).json({
        status: "error",
        message: error.message || "Internal Server Error",
        error: error,
    });
};

export { sendSuccessResponse, sendErrorResponse };
