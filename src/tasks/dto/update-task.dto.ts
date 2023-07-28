export class UpdateTaskDto {
  id: number;
  title?: string;
  description?: string;
  /**
   * @example 'open'
   * @example 'pending'
   * @example 'closed'
   */
  status?: string;
}
