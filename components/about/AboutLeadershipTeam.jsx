"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import carouselStyles from "@/components/homes/home-1/Properties2Carousel.module.css";

function LeaderCard({ leader, idx }) {
  return (
    <div className="about-v2-team-card">
      <div className="about-v2-team-card-img-wrap">
        {leader.image ? (
          <Image
            className="about-v2-team-card-img"
            src={leader.image}
            alt={leader.name || "Leader"}
            fill
            sizes="(max-width: 767px) 92vw, (max-width: 1199px) 46vw, 32vw"
          />
        ) : (
          <div className={`about-v2-team-img-placeholder img-p${(idx % 3) + 1}`}>
            👤
          </div>
        )}
        <div className="about-v2-team-badge">
          <h4>{leader.name}</h4>
          {leader.role ? <span>{leader.role}</span> : null}
        </div>
      </div>
    </div>
  );
}

export default function AboutLeadershipTeam({ leaders = [] }) {
  const list = Array.isArray(leaders) ? leaders : [];

  if (!list.length) {
    return <div className="about-v2-team-grid" aria-hidden />;
  }

  if (list.length <= 3) {
    return (
      <div className="about-v2-team-grid">
        {list.map((leader, idx) => (
          <LeaderCard key={`${leader.name}-${idx}`} leader={leader} idx={idx} />
        ))}
      </div>
    );
  }

  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      pagination={{ clickable: true }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      breakpoints={{
        0: { slidesPerView: 1.12, spaceBetween: 12 },
        768: { slidesPerView: 2, spaceBetween: 16 },
        992: { slidesPerView: 3, spaceBetween: 18 },
        1200: { slidesPerView: 4, spaceBetween: 18 },
      }}
      loop
      className={`swiper about-v2-team-swiper ${carouselStyles.carousel}`}
    >
      {list.map((leader, idx) => (
        <SwiperSlide className="swiper-slide" key={`${leader.name}-${idx}`}>
          <LeaderCard leader={leader} idx={idx} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
