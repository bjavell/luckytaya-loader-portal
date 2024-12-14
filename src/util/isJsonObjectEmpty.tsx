function isJsonObjectEmpty(obj: Record<string, unknown>): boolean {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
  
    return true;
  }
  
export default isJsonObjectEmpty