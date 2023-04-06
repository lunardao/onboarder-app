import { useDHConnect } from "@daohaus/connect";
import { TARGET_DAO } from "../targetDao";
import {
  DataIndicator,
  Divider,
  Link,
  ParLg,
  ParMd,
  Button,
} from "@daohaus/ui";
import { useMemo } from "react";
import { formatValueTo, fromWei } from "@daohaus/utils";
import styled from "styled-components";
import { DelegateData, Member } from "../utils/types";
import { useRecords } from "../hooks/useRecord";
import { isDelegateData } from "../utils/typeguards";
import { DataGrid } from "./DataGrid";
import { StyledRouterLink } from "./Layout";

const MembershipBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 2rem;
`;

export const MembershipSection = ({
  user,
  balance,
}: {
  user?: Member | null;
  balance?: string | null;
}) => {
  const { address } = useDHConnect();
  const { records } = useRecords({
    daoId: TARGET_DAO[import.meta.env.VITE_TARGET_KEY].ADDRESS,
    chainId: TARGET_DAO[import.meta.env.VITE_TARGET_KEY].CHAIN_ID,
    recordType: "credential",
  });

  const userRecords = useMemo(() => {
    if (!records?.length || !address) return [];
    return records
      .filter(
        (record) =>
          isDelegateData(record.parsedContent) &&
          record?.parsedContent?.recipientAddress?.toLowerCase() ===
            address?.toLowerCase()
      )
      .sort((a, b) => (Number(a?.createdAt) > Number(b?.createdAt) ? -1 : 1))
      .map(
        (record) =>
          isDelegateData(record?.parsedContent) && {
            ...record.parsedContent,
            createdAt: record.createdAt,
          }
      ) as DelegateData[];
  }, [records, address]);
  const latestRecord = userRecords?.[0];
  return (
    <MembershipBox>
      {user ? (
        <ParLg>
          You are a member{" "}
          <StyledRouterLink to="/unstake">unstake</StyledRouterLink>
        </ParLg>
      ) : (
        <ParLg>You are not a member of this DAO</ParLg>
      )}
      <DataGrid>
        <DataIndicator
          size="sm"
          label={`Your ${TARGET_DAO[import.meta.env.VITE_TARGET_KEY].STAKE_TOKEN_SYMBOL} Balance`}
          data={
            balance != null
              ? formatValueTo({
                  value: fromWei(balance),
                  format: "numberShort",
                })
              : "--"
          }
        />
        <DataIndicator
          size="sm"
          label={"DAO Shares"}
          data={
            user?.shares != null
              ? formatValueTo({
                  value: fromWei(user.shares),
                  decimals: TARGET_DAO[import.meta.env.VITE_TARGET_KEY].STAKE_TOKEN_DECIMALS,
                  format: "number",
                })
              : "--"
          }
        />
        <DataIndicator
          size="sm"
          label={"DAO Loot"}
          data={
            user?.loot != null
              ? formatValueTo({
                  value: fromWei(user.loot),
                  decimals: TARGET_DAO[import.meta.env.VITE_TARGET_KEY].STAKE_TOKEN_DECIMALS,
                  format: "number",
                })
              : "--"
          }
        />
      </DataGrid>
      <Divider className={user ? "space" : ""} />
      {user && (
        <>
          <ParLg className="space">Verification Status:</ParLg>
          {latestRecord ? (
            <>
              <ParMd className="small-space">
                The DAO are verified 
              </ParMd>
              <StyledRouterLink to={`/profile/${address}`} className="space">
                View your profile here
              </StyledRouterLink>
            </>
          ) : (
            <>
              <ParMd className="small-space">
                You are not yet verified to be a {TARGET_DAO[import.meta.env.VITE_TARGET_KEY].DELEGATAE_NAME}. (optional)
              </ParMd>
              <StyledRouterLink to={`/apply`} className="space">
                Verify here
              </StyledRouterLink>
            </>
          )}
          <Divider className="space" />
        </>
      )}
    </MembershipBox>
  );
};
