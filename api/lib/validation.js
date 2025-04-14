/**
 * 输入验证模块
 * 提供常用的输入验证函数
 */
import { ErrorTypes } from './error-handler.js';

// 验证必填字段
export const validateRequired = (obj, fields, errorMessage = '必填字段缺失') => {
  const missingFields = fields.filter(field => !obj[field]);
  
  if (missingFields.length > 0) {
    throw ErrorTypes.BAD_REQUEST(
      errorMessage,
      { missingFields }
    );
  }
  
  return true;
};

// 验证评分值
export const validateRating = (rating) => {
  const ratingNum = Number(rating);
  
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw ErrorTypes.BAD_REQUEST(
      'Invalid rating value',
      { message: 'Rating must be a number between 1 and 5' }
    );
  }
  
  return true;
};

// 验证评论内容
export const validateComment = (text) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw ErrorTypes.BAD_REQUEST(
      'Invalid comment text',
      { message: 'Comment text cannot be empty' }
    );
  }
  
  if (text.length > 1000) {
    throw ErrorTypes.BAD_REQUEST(
      'Comment too long',
      { message: 'Comment text cannot exceed 1000 characters' }
    );
  }
  
  return true;
};

// 验证用户名
export const validateUsername = (username) => {
  if (username && (typeof username !== 'string' || username.length > 50)) {
    throw ErrorTypes.BAD_REQUEST(
      'Invalid username',
      { message: 'Username must be a string with maximum 50 characters' }
    );
  }
  
  return true;
};

// 验证密码强度
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw ErrorTypes.BAD_REQUEST(
      'Invalid password',
      { message: 'Password must be at least 8 characters long' }
    );
  }
  
  return true;
};

// 导出默认对象
export default {
  validateRequired,
  validateRating,
  validateComment,
  validateUsername,
  validatePassword
};
