/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式模板
 */
export const formatDate = (date: Date | number, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
};

/**
 * 简单的权限判断
 */
export const hasRole = (userRole: string, requiredRole: string) => {
  return userRole === requiredRole;
};
