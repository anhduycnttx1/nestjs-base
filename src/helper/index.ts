export function appendUrlDomain(path: string): string {
  return `http://localhost:8000/api/posi/v1/${path}`;
}

export function isNumberInput(value: string | number): boolean {
  // chuyển đổi giá trị về kiểu number bằng cách sử dụng toán tử "+" hoặc hàm Number()
  const num = +value;
  // kiểm tra giá trị đã chuyển đổi có phải là một số hay không
  return !isNaN(num);
}
