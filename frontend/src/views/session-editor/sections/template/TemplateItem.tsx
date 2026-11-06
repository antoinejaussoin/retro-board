import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { getTemplateColumns } from 'state';
import { Template, TemplateDefinition } from 'state/types';
import Icon from 'components/Icon/Icon';
import { tokens } from 'tokens';

type TemplateItemProps = {
  definition: TemplateDefinition;
  selected: boolean;
  onSelect: (template: Template) => void;
};

export function TemplateItem({
  definition,
  selected,
  onSelect,
}: TemplateItemProps) {
  const { t } = useTranslation();
  const columns = getTemplateColumns(definition.type, t);
  return (
    <Item
      selected={selected}
      onClick={() => {
        onSelect(definition.type);
      }}
    >
      <ItemIcon>
        {columns.map((col) => (
          <Icon key={col.type} icon={col.icon} />
        ))}
      </ItemIcon>
      <ItemTitle>{definition.name}</ItemTitle>
    </Item>
  );
}

const Item = styled.div<{ selected: boolean }>`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${tokens.border};
  background-color: ${(props) =>
    props.selected ? 'var(--rs-accent-dark)' : tokens.paper};
  color: ${(props) =>
    props.selected ? 'var(--rs-accent-contrast)' : tokens.ink};
  min-width: 185px;

  :hover {
    background-color: ${(props) =>
      props.selected ? 'var(--rs-accent-dark)' : 'var(--rs-accent-wash)'};
    color: ${(props) =>
      props.selected ? 'var(--rs-accent-contrast)' : tokens.ink};
  }
`;

const ItemIcon = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-around;
`;

const ItemTitle = styled.div`
  margin-top: 15px;
  font-size: 0.8rem;
`;
