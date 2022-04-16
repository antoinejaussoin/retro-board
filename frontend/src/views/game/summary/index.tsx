import { useState, useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PhoneIcon from '@mui/icons-material/Phone';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { ColumnContent } from '../types';
import { Page } from '../../../components/Page';
import SummaryMode from './SummaryMode';

interface SummaryModeProps {
  columns: ColumnContent[];
  search: string;
}

const SummaryHome = ({ columns, search }: SummaryModeProps) => {
  const [tab, setTab] = useState(0);
  const handleChange = useCallback((_: unknown, v: number) => setTab(v), []);
  return (
    <>
      <AppBar position="static" color="default">
        <Tabs
          value={tab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons
          indicatorColor="primary"
          textColor="primary"
          aria-label="summary tabs"
          allowScrollButtonsMobile
        >
          <Tab label="Summary" icon={<PhoneIcon />} />
          <Tab label="Markdown" icon={<FavoriteIcon />} />
        </Tabs>
      </AppBar>
      <Page>
        <SummaryMode columns={columns} search={search} />
      </Page>
    </>
  );
};

export default SummaryHome;
