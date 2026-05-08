"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import DropdownSelect from "../common/DropdownSelect";
import PaginationRound from "../common/PaginationRound";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);
const PAGE_SIZE = 12;

export default function Agents() {
  const { data, isLoading } = useSWR("/cms/team-agents", fetcher);
  const agents = data?.data || [];

  const [q, setQ] = useState("");
  const [agency, setAgency] = useState("All agency");
  const [city, setCity] = useState("All location");
  const [sort, setSort] = useState("Sort by (Default)");
  const [page, setPage] = useState(1);

  const agencyOptions = useMemo(() => {
    const set = new Set(
      agents.map((a) => (a.agency || "").trim()).filter(Boolean),
    );
    return ["All agency", ...[...set].sort()];
  }, [agents]);

  const cityOptions = useMemo(() => {
    const set = new Set(
      agents.map((a) => (a.city || "").trim()).filter(Boolean),
    );
    return ["All location", ...[...set].sort()];
  }, [agents]);

  const filtered = useMemo(() => {
    let list = [...agents];
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(qq) ||
          (a.role || "").toLowerCase().includes(qq),
      );
    }
    if (agency && agency !== "All agency") {
      list = list.filter((a) => (a.agency || "") === agency);
    }
    if (city && city !== "All location") {
      list = list.filter((a) => (a.city || "") === city);
    }
    if (sort === "Newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    } else if (sort === "Oldest") {
      list.sort(
        (a, b) =>
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      );
    } else {
      list.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, {
          sensitivity: "base",
        }),
      );
    }
    return list;
  }, [agents, q, agency, city, sort]);

  const total = filtered.length;
  const totalPages =
    total === 0 ? 0 : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSafe =
    totalPages === 0 ? 1 : Math.min(page, totalPages);
  const slice = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE,
  );

  return (
    <section className="section-agent">
      <div className="tf-container">
        <div className="row">
          <div className="box-title style-2 mb-48">
            <h2>Our team</h2>
            <div className="wrap-sort">
              <form onSubmit={(e) => e.preventDefault()}>
                <fieldset>
                  <input
                    className=""
                    type="text"
                    placeholder="Member name"
                    name="name"
                    tabIndex={2}
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                    aria-required="true"
                  />
                </fieldset>
              </form>

              <DropdownSelect
                options={agencyOptions}
                selectedValue={agency}
                onChange={(v) => {
                  setAgency(v);
                  setPage(1);
                }}
                addtionalParentClass=""
              />

              <DropdownSelect
                options={cityOptions}
                selectedValue={city}
                onChange={(v) => {
                  setCity(v);
                  setPage(1);
                }}
                addtionalParentClass=""
              />

              <DropdownSelect
                options={["Sort by (Default)", "Newest", "Oldest"]}
                selectedValue={sort}
                onChange={setSort}
                addtionalParentClass="select-sort style-2"
              />
            </div>
          </div>
          {isLoading ? (
            <p className="text-1">Loading agents…</p>
          ) : (
            <div className="tf-grid-layout-2 lg-col-4 md-col-3 sm-col-2">
              {slice.map((agent) => (
                <div
                  key={String(agent._id)}
                  className="agent-item hover-img"
                >
                  <div className="image-wrap">
                    <Image
                      className="lazyload agent-card-photo"
                      data-src={agent.photo || "/images/section/agent-item-1.jpg"}
                      alt=""
                      width={400}
                      height={320}
                      src={
                        agent.photo || "/images/section/agent-item-1.jpg"
                      }
                    />
                    <ul className="tf-social style-3">
                      {agent.socialFacebook ? (
                        <li>
                          <a
                            href={agent.socialFacebook}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="icon-fb" />
                          </a>
                        </li>
                      ) : null}
                      {agent.socialTwitter ? (
                        <li>
                          <a
                            href={agent.socialTwitter}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="icon-X" />
                          </a>
                        </li>
                      ) : null}
                      {agent.socialLinkedin ? (
                        <li>
                          <a
                            href={agent.socialLinkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="icon-linked" />
                          </a>
                        </li>
                      ) : null}
                      {agent.socialInstagram ? (
                        <li>
                          <a
                            href={agent.socialInstagram}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="icon-ins" />
                          </a>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                  <div className="content">
                    <div className="author">
                      <h5 className="name lh-30">{agent.name}</h5>
                      <p className="text-2 lh-18">
                        {agent.role || "Agent"}
                      </p>
                    </div>
                    <div className="wrap-btn-icon">
                      {agent.phone ? (
                        <a
                          href={`tel:${agent.phone.replace(/\s/g, "")}`}
                          className="btn-icon"
                        >
                          <i className="icon-phone-3" />
                        </a>
                      ) : null}
                      {agent.email ? (
                        <a
                          href={`mailto:${agent.email}`}
                          className="btn-icon"
                        >
                          <i className="icon-letter" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && total === 0 ? (
            <div className="team-empty-state" role="status">
              <div className="team-empty-state__icon" aria-hidden>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="team-empty-state__title">No team members yet</h3>
              <p className="team-empty-state__text">
                We’re building our roster. Adjust your filters or check back soon—new profiles appear here as soon as they’re published.
              </p>
            </div>
          ) : null}
          {totalPages > 1 ? (
            <div className="wrap-pagination">
              <p
                className="text-1"
                style={{
                  textAlign: "center",
                  marginBottom: 16,
                  color: "#6b7280",
                }}
              >
                {`Showing ${(pageSafe - 1) * PAGE_SIZE + 1}–${Math.min(
                  pageSafe * PAGE_SIZE,
                  total,
                )} of ${total} team member${total === 1 ? "" : "s"}`}
              </p>
              <PaginationRound
                page={pageSafe}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
