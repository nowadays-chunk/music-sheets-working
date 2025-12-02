"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Collapse,
  IconButton,
  Typography,
  Avatar,
  Skeleton,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { red } from "@mui/material/colors";
import { styled } from "@mui/material/styles";

// MUI Expand Component
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  marginLeft: "auto",
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

// -----------------------------------------
//   100 RSS FEEDS
// -----------------------------------------
const RSS_FEEDS = [
  "https://pan-african-music.com/en/feed/",
  "https://native-mag.com/feed/",
  "https://guardian.ng/category/life/music/feed/",
  "https://www.musicinafrica.net/rss",
  "https://afropop.org/rss",
  "https://notjustok.com/feed/",
  "https://www.okayafrica.com/rss/",
  "https://yawapress.com/feed/",
  "https://www.yabiladi.com/rss/actualites/musique",
  "https://www.hitradio.ma/feed",
  "https://www.maghrebvoices.com/rss",
  "https://en.hespress.com/feed",
  "https://www.thenationalnews.com/culture/music/rss",
  "https://www.musicnation.me/feed/",
  "https://www.pulse.ng/lifestyle/music/rss",
  "https://ghanamotion.com/feed/",
  "https://www.ghanamusic.com/feed/",
  "https://rapradar.com/feed/",
  "https://www.okayplayer.com/feed/",
  "https://pitchfork.com/rss/news/",
  "https://www.rollingstone.com/music/music-news/feed/",
  "https://www.billboard.com/feed/",
  "https://www.nme.com/feed",
  "https://www.stereogum.com/feed/",
  "https://consequence.net/feed/",
  "https://www.spin.com/feed/",
  "https://www.thefader.com/feed",
  "https://www.npr.org/rss/rss.php?id=1039",
  "https://www.bbc.co.uk/music/articles.rss",
  "https://hotnewhiphop.com/feed/",
  "https://genius.com/articles.rss",
  "https://jpopasia.com/feed/",
  "https://www.koreaboo.com/feed/",
  "https://www.soompi.com/feed",
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCdN4aXTrHAtfgbVG9HjBmxQ",
  "https://www.youtube.com/feeds/videos.xml?channel_id=UC2Qw1dzXDBAZPwS7zm37g8g",
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCLkAepWjdylmXSltofFvsYQ",
  "https://www.youtube.com/feeds/videos.xml?channel_id=UC5nc_ZtjKW1htCVZVRxlQAQ",
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCt7fwAhXDy3oNFTAzF2o8Pw",
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCZFWPqqPkFlNwIxcpsLOwew",
  "https://www.youtube.com/feeds/videos.xml?channel_id=UC3IZKseVpdzPSBaWxBxundA",
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCsRM0YB_dabtEPGPTKo-gcw",
];

// -----------------------------------------
// CORS-SAFE RSS FETCHER (rss2json)
// -----------------------------------------
async function fetchRSS(url) {
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    );

    if (!res.ok) throw new Error("Failed RSS");

    const data = await res.json();
    if (!data.items) return [];

    return data.items.map((i) => ({
      title: i.title,
      link: i.link,
      date: i.pubDate,
      content: i.description,
      thumbnail: i.thumbnail || i.enclosure?.link || "",
      source: data.feed?.title || url,
    }));
  } catch (e) {
    console.log("RSS error for", url);
    return [];
  }
}

// -----------------------------------------
// MAIN COMPONENT
// -----------------------------------------
export default function MusicianNewsMasonry() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [filters, setFilters] = useState({
    artists: [],
    genres: [],
    songs: [],
  });

  const observer = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // -----------------------------------------
  // Load bookmarks from localStorage
  // -----------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("bookmarks_music");
    if (stored) setBookmarks(JSON.parse(stored));

    const storedFilters = localStorage.getItem("filters_music");
    if (storedFilters) setFilters(JSON.parse(storedFilters));
  }, []);

  const saveBookmarks = (list) => {
    localStorage.setItem("bookmarks_music", JSON.stringify(list));
  };

  const saveFilters = (f) => {
    localStorage.setItem("filters_music", JSON.stringify(f));
  };

  // -----------------------------------------
  // Add bookmark
  // -----------------------------------------
  const toggleBookmark = (article) => {
    let updated;
    if (bookmarks.some((b) => b.link === article.link)) {
      updated = bookmarks.filter((b) => b.link !== article.link);
    } else {
      updated = [...bookmarks, article];
    }
    setBookmarks(updated);
    saveBookmarks(updated);
  };

  // -----------------------------------------
  // Filtering (artist/genre/song less)
  // -----------------------------------------
  const addFilter = (type, value) => {
    const updated = {
      ...filters,
      [type]: [...filters[type], value.toLowerCase()],
    };
    setFilters(updated);
    saveFilters(updated);
  };

  const applyFilters = (items) => {
    return items.filter((a) => {
      const text = (a.title + " " + a.content).toLowerCase();
      return !filters.artists.some((f) => text.includes(f)) &&
             !filters.genres.some((f) => text.includes(f)) &&
             !filters.songs.some((f) => text.includes(f));
    });
  };

  // -----------------------------------------
  // Load More Feeds (infinite scroll)
  // -----------------------------------------
  const fetchPage = async () => {
    if (!hasMore) return;
    setLoading(true);

    const batch = RSS_FEEDS.slice((page - 1) * 5, page * 5);
    if (batch.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    let results = [];
    for (let f of batch) {
      const r = await fetchRSS(f);
      results.push(...r);
    }

    const merged = [...articles, ...results];
    merged.sort((a, b) => new Date(b.date) - new Date(a.date));

    setArticles(merged);
    setLoading(false);
  };

  useEffect(() => { fetchPage(); }, [page]);

  // -----------------------------------------
  // Infinite Scroll Observer
  // -----------------------------------------
  const lastRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((p) => p + 1);
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // -----------------------------------------
  // Search filter
  // -----------------------------------------
  const filteredArticles = applyFilters(
    articles.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase())
    )
  );

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div style={{ paddingLeft: 100, paddingRight: 100, paddingTop: 30 }}>
      {/* Search */}
      <input
        placeholder="Search news..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px",
        }}
      />

      {/* Masonry columns */}
      <div
        style={{
          columnCount: 3,
          columnGap: "25px",
        }}
      >
        {filteredArticles.map((a, idx) => {
          const isLast = idx === filteredArticles.length - 1;

          return (
            <div
              key={idx}
              ref={isLast ? lastRef : null}
              style={{ breakInside: "avoid", marginBottom: 25 }}
            >
              <Card sx={{ width: "100%", display: "inline-block" }}>
                <CardHeader
                  avatar={<Avatar sx={{ bgcolor: red[500] }}>M</Avatar>}
                  action={
                    <IconButton
                      onClick={() => {
                        // Filtering menu
                        addFilter("artists", a.title.split(" ")[0]);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={a.title}
                  subheader={new Date(a.date).toLocaleString()}
                />

                {a.thumbnail && !a._imgError ? (
                  <CardMedia
                    component="img"
                    height="220"
                    image={a.thumbnail}
                    alt=""
                    onError={() => {
                      a._imgError = true;
                      setArticles([...articles]); // trigger re-render removing image
                    }}
                  />
                ) : null}


                <CardContent>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {a.content.replace(/<[^>]+>/g, "").slice(0, 200)}...
                  </Typography>
                </CardContent>

                <CardActions disableSpacing>
                  <IconButton onClick={() => toggleBookmark(a)}>
                    <FavoriteIcon
                      color={
                        bookmarks.some((b) => b.link === a.link)
                          ? "error"
                          : "inherit"
                      }
                    />
                  </IconButton>

                  <IconButton
                    aria-label="share"
                    onClick={() => window.open(a.link, "_blank")}
                  >
                    <OpenInNewIcon />
                  </IconButton>

                  <ExpandMore
                    expand={expandedIndex === idx}
                    onClick={() =>
                      setExpandedIndex(expandedIndex === idx ? null : idx)
                    }
                    aria-expanded={expandedIndex === idx}
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                </CardActions>

                <Collapse in={expandedIndex === idx} timeout="auto">
                  <CardContent>
                    <Typography>
                      {a.content.replace(/<[^>]+>/g, "")}
                    </Typography>
                  </CardContent>
                </Collapse>
              </Card>
            </div>
          );
        })}

        {/* Loading Skeletons */}
        {loading && (
          <>
            <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
          </>
        )}
      </div>
    </div>
  );
}
