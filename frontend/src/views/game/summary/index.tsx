import { ColumnContent } from '../types';
import { SummaryMode } from './SummaryMode';

interface SummaryModeProps {
  columns: ColumnContent[];
  search: string;
}

const SummaryHome = ({ columns, search }: SummaryModeProps) => {
  return <SummaryMode columns={columns} search={search} />;
};

export default SummaryHome;
