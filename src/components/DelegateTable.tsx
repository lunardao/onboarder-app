import { Card, Link, ParMd, widthQuery } from '@daohaus/ui';

import { formatValueTo, fromWei, votingPowerPercentage } from '@daohaus/utils';
import { useMemo } from 'react';
import { Column } from 'react-table';
import styled from 'styled-components';
import { MolochV3Dao } from '@daohaus/moloch-v3-data';
import { TARGET_DAO } from '../targetDao';

import { RegisteredMember } from '../utils/types';
import { DaoTable } from './DaoTable';
import { sharesDelegatedToMember } from '../utils/conversion';
import { StyledRouterLink } from './Layout';
import { MemberProfileCard } from '@daohaus/moloch-v3-macro-ui';
import { useCurrentDao, useDaoMember } from '@daohaus/moloch-v3-hooks';


const DelegateContainer = styled(Card)`
  padding: 3rem;
  border: none;
  margin-bottom: 3rem;
  min-height: 20rem;
  width: 100%;
  overflow-x: auto;
  th {
    min-width: 10rem;
  }
  .hide-sm {
    button {
      padding-left: 0.5rem;
    }
  }
  @media ${widthQuery.lg} {
    max-width: 100%;
    min-width: 0;
  }
  @media ${widthQuery.md} {
    .hide-sm {
      display: none;
    }
  }
`;

export const DelegateTable = ({
  registeredDelegates,
  dao,
}: {
  registeredDelegates: RegisteredMember[];
  dao?: MolochV3Dao;
  userAddress?: string;
  userDelegateAddress?: string;
}) => {
  const { isFetched, isFetching, member } = useDaoMember();
  const { daoChain, daoId } = useCurrentDao();
  const columns = useMemo<Column<RegisteredMember>[]>(() => {
    if (!dao || !daoChain || !daoId) return [];
    return [
      {
        Header: 'Champion',
        accessor: 'memberAddress',
        Cell: ({ value }) => {
          return (
            // <MemberProfileCard
            //   daoChain={daoChain}
            //   daoId={daoId}
            //   memberAddress={value}
            // />
            <ParMd>{value}</ParMd>
          );
        },
      },
      {
        Header: 'Power',
        accessor: 'id',
        Cell: ({ row }) => {
          const { delegateShares } = row.original;
          return (
            <>{votingPowerPercentage(dao?.totalShares, delegateShares)} %</>
          );
        },
      },
      {
        Header: 'Shares',
        accessor: 'shares',
        Cell: ({ value }) => {
          return (
            <>
              {formatValueTo({
                value: fromWei(value),
                decimals: 2,
                format: 'number',
              })}
            </>
          );
        },
      },
      {
        Header: 'Delegate Shares',
        accessor: 'delegateShares',
        Cell: ({ value, row }) => {
          const { shares } = row.original;
          const delegatedShares = sharesDelegatedToMember(value, shares);

          return (
            <>
              {formatValueTo({
                value: fromWei(delegatedShares),
                decimals: 2,
                format: 'number',
              })}
            </>
          );
        },
      },
      {
        Header: 'Delegatees',
        accessor: 'delegateOfCount',
        Cell: ({ value }) => {
          return <>{value}</>;
        },
      },
      {
        Header: 'Platform',
        accessor: 'votes',
        Cell: ({ row }) => {
          const { memberAddress } = row.original;
          return <StyledRouterLink to={`/profile/${memberAddress}`}>See Profile</StyledRouterLink>;
        },
      },
    ];
  }, [dao, registeredDelegates]);

  return (
    <DelegateContainer>
      <DaoTable<RegisteredMember>
        tableData={registeredDelegates}
        columns={columns}
        sortableColumns={[]}
      />
    </DelegateContainer>
  );
};
