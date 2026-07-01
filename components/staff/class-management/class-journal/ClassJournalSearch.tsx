"use client";

import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { buildClassJournalHref } from "@/utils/classJournalHref";

interface ClassJournalSearchProps {
  defaultKeyword?: string;
  mineOnly?: boolean;
}

export function ClassJournalSearch({ defaultKeyword = "", mineOnly = false }: ClassJournalSearchProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(defaultKeyword);

  return (
    <SearchForm
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(buildClassJournalHref(1, searchInput, mineOnly));
      }}
    >
      <SearchInput
        aria-label="수업 일지 검색"
        placeholder="반 or 제목 or 내용 or 작성자 검색"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <SearchButton type="submit" aria-label="검색">
        <IconSearch size={18} stroke={2.25} />
      </SearchButton>
    </SearchForm>
  );
}

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 13.75rem;
  min-height: 2.25rem;
  border: 0;
  border-bottom: 1px solid #c0c0c0;
  border-radius: 0;
  background: ${colors.white};
  padding: 0.5rem ${spacing.space16};
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};
  outline: none;

  &::placeholder {
    color: ${colors.placeholder};
  }

  @media (min-width: 120rem) {
    width: 20.625rem;
    min-height: 3rem;
    font-size: ${typography.fontSize20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex: 1 1 auto;
    width: 100%;
  }
`;

const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 999px;
  background: #414141;
  color: ${colors.white};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 3rem;
    height: 3rem;
  }
`;
