export interface TimeSheetData {
  id: number;
  start: Date;
  startLunch: Date;
  endLunch: Date;
  end: Date;
  time?: string;
}

export interface PaginatedData<T> {
  count: number;
  currentPage: number;
  items: T[];
  pageSize: number;
  totalPages: number;
}
