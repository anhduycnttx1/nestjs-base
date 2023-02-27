import { Md5 } from 'ts-md5';

export function appendUrlDomain(path: string): string {
  return `http://localhost:8000/api/posi/v1/${path}`;
}

export function isNumberInput(value: string | number): boolean {
  // chuyển đổi giá trị về kiểu number bằng cách sử dụng toán tử "+" hoặc hàm Number()
  const num = +value;
  // kiểm tra giá trị đã chuyển đổi có phải là một số hay không
  return !isNaN(num);
}

export function generateKeyCache(path: string, objFilter: any) {
  const objStr = JSON.stringify(objFilter);
  const hasherObj = Md5.hashStr(objStr);
  return `${path}:${hasherObj}`;
}

export function validatedKeyCache(key: string, objFilter: any) {
  const objStr = JSON.stringify(objFilter);
  return Md5.hashStr(objStr) === key.split(':')?.[1];
}
