"use client";

import Image from "next/image";
import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { colors, spacing, typography } from "@/styles/tokens";
import type { EventPhoto } from "@/types/home";

type EventPhotoCardProps = {
  photos: EventPhoto[];
};

export default function EventPhotoCard({ photos }: EventPhotoCardProps) {
  return (
    <Card title="행사 사진" actionLabel="더보기">
      <PhotoGrid>
        {photos.map((photo) => (
          <PhotoItem key={photo.id}>
            <Thumbnail>
              <PhotoImage
                src={photo.imageUrl}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </Thumbnail>
            <PhotoTitle>{photo.title}</PhotoTitle>
            <PhotoDate>{photo.date}</PhotoDate>
          </PhotoItem>
        ))}
      </PhotoGrid>
    </Card>
  );
}

const Card = styled(HomeCard)`
  height: 100%;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;

  @media (min-width: 120rem) {
    gap: ${spacing.space47};
  }

  @media (max-width: 37.5rem) {
    grid-template-columns: 1fr;
  }
`;

const PhotoItem = styled.article`
  min-width: 0;
`;

const Thumbnail = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 1.56 / 1;
  margin-bottom: ${spacing.space12};
  border: 0;
  border-radius: 0;
  background-color: #d9d9d9;

  @media (min-width: 120rem) {
    margin-bottom: ${spacing.space16};
  }
`;

const PhotoImage = styled(Image)`
  object-fit: cover;
`;

const PhotoTitle = styled.h3`
  overflow: hidden;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const PhotoDate = styled.time`
  display: inline-block;
  margin-top: ${spacing.space4};
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  font-weight: 300;

  @media (min-width: 120rem) {
    margin-top: ${spacing.space8};
    font-size: ${typography.fontSize20};
  }
`;
