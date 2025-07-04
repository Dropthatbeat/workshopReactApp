import { useState, useEffect } from 'react'
import './App.css'

const generalHeaderBg = "https://workshop.codes/assets/layout/header-bg_lg-c18d17a31982e6d6091325fb707236f797ce170bfdb83c44c69e5b9dd28ac9d8.jpg"
const wikiHeaderBg = "https://workshop.codes/assets/wiki/bg-7e789298908493a8824212791168951352999c52258cf8f5d34c422b83c5f1f4.jpg"
const pageBg = "https://workshop.codes/assets/brand/pattern-1d6879b9cb809bf728cbeec22b6479cd19a2536acda1f7a90029cfce8acc5338.jpg"

const ENDPOINTS = [
  { label: "Homepage", value: "homepage" },
  { label: "On Fire", value: "onfire" },
  { label: "Search", value: "search" },
  { label: "Hero/Map Filter", value: "filter" },
  { label: "User Codes", value: "user" },
  { label: "Individual Code", value: "code" },
  { label: "Wiki Search", value: "wiki" },
  { label: "Wiki Dictionary", value: "wikidict" }
]

const fetchWithTimeout = (url, options = {}, timeout = 7000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id))
}

function App() {
  const [endpoint, setEndpoint] = useState("homepage")
  const [homepage, setHomepage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [hero, setHero] = useState("")
  const [map, setMap] = useState("")
  const [username, setUsername] = useState("")
  const [code, setCode] = useState("")
  const [results, setResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [wikiResults, setWikiResults] = useState(null)
  const [wikiDict, setWikiDict] = useState(null)

  // Helper to build endpoint URL
  const getUrl = () => {
    switch (endpoint) {
      case "homepage":
        return "https://workshop.codes/.json"
      case "onfire":
        return "https://workshop.codes/on-fire.json"
      case "search":
        return `https://workshop.codes/search.json?search=${encodeURIComponent(search)}${page > 1 ? `&page=${page}` : ""}`
      case "filter":
        return `https://workshop.codes/search.json?${hero ? `hero=${encodeURIComponent(hero)}` : ""}${map ? `${hero ? "&" : ""}map=${encodeURIComponent(map)}` : ""}${search ? `${hero || map ? "&" : ""}query=${encodeURIComponent(search)}` : ""}${page > 1 ? `&page=${page}` : ""}`
      case "user":
        return `https://workshop.codes/u/${encodeURIComponent(username)}${page > 1 ? `/page/${page}` : ""}.json`
      case "code":
        return `https://workshop.codes/${encodeURIComponent(code)}.json`
      case "wiki":
        return `https://workshop.codes/wiki/search/${encodeURIComponent(search)}.json`
      case "wikidict":
        return `https://workshop.codes/wiki/dictionary.json`
      default:
        return "https://workshop.codes/.json"
    }
  }

  // Fetch data for selected endpoint
  const fetchData = () => {
    setLoading(true)
    setError(null)
    setResults(null)
    setWikiResults(null)
    setWikiDict(null)
    const url = getUrl()
    fetchWithTimeout(url, {}, 7000)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok')
        return res.json()
      })
      .then(data => {
        if (endpoint === "homepage" || endpoint === "onfire" || endpoint === "user" || endpoint === "filter") {
          setHomepage(data)
        } else if (endpoint === "search") {
          setResults(data.results || data)
          setHasMore(data.has_more || (data.total_pages && page < data.total_pages))
        } else if (endpoint === "wiki") {
          setWikiResults(data)
        } else if (endpoint === "wikidict") {
          setWikiDict(data)
        } else if (endpoint === "code") {
          setResults([data])
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.name === 'AbortError' ? 'Request timed out' : err.message)
        setLoading(false)
      })
  }

  // Initial homepage fetch
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  }, [endpoint, page])

  // Reset page on endpoint change
  useEffect(() => {
    setPage(1)
  }, [endpoint])

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchData()
  }

  // Handle logo click to reset to homepage
  const handleLogoClick = () => {
    setEndpoint("homepage")
    setSearch("")
    setHero("")
    setMap("")
    setUsername("")
    setCode("")
    setResults(null)
    setWikiResults(null)
    setWikiDict(null)
    setSearchError(null)
    setPage(1)
    fetchData()
  }

  // Pagination
  const handleNextPage = () => {
    setPage(p => p + 1)
  }
  const handlePrevPage = () => {
    if (page <= 1) return
    setPage(p => p - 1)
  }

  // Which data to show
  let displayData = null
  if (endpoint === "homepage" || endpoint === "onfire" || endpoint === "user" || endpoint === "filter") {
    displayData = homepage
  } else if (endpoint === "search" || endpoint === "code") {
    displayData = results
  } else if (endpoint === "wiki") {
    displayData = wikiResults
  } else if (endpoint === "wikidict") {
    displayData = wikiDict
  }

  // Render input fields based on endpoint
  const renderInputs = () => {
    switch (endpoint) {
      case "search":
        return (
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search workshop codes..."
            style={androidInputStyle}
          />
        )
      case "filter":
        return (
          <>
            <input
              type="text"
              value={hero}
              onChange={e => setHero(e.target.value)}
              placeholder="Hero (e.g. reinhardt)"
              style={androidInputStyle}
            />
            <input
              type="text"
              value={map}
              onChange={e => setMap(e.target.value)}
              placeholder="Map (e.g. eichenwalde)"
              style={androidInputStyle}
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Query (optional)"
              style={androidInputStyle}
            />
          </>
        )
      case "user":
        return (
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            style={androidInputStyle}
          />
        )
      case "code":
        return (
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Workshop Code"
            style={androidInputStyle}
          />
        )
      case "wiki":
        return (
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Wiki search..."
            style={androidInputStyle}
          />
        )
      default:
        return null
    }
  }

  // Card rendering for code lists
  const renderCards = (data) => {
    if (!Array.isArray(data)) return null
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1em',
        justifyContent: 'center'
      }}>
        {data.map((item, idx) => (
          <div key={item.code || item.id || idx} style={{
            background: '#23272f',
            color: '#fff',
            borderRadius: '18px',
            padding: '1.2em',
            width: '96vw',
            maxWidth: 370,
            boxShadow: '0 4px 16px #0004',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '1em',
            border: '1.5px solid #333'
          }}>
            <a
              href={item.code ? `https://workshop.codes/${item.nice_url ? item.nice_url : item.code}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{textDecoration: 'none', color: 'inherit', width: '100%'}}
            >
              {item.thumbnail &&
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginBottom: '0.7em',
                    background: '#111'
                  }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              }
              <h3 style={{
                margin: '0.5em 0 0.2em 0',
                fontSize: '1.18em',
                fontWeight: 600,
                letterSpacing: 0.2
              }}>{item.title || item.name || item.term || item.code}</h3>
              {item.user && (
                <div style={{fontSize: '1em', color: '#8de1c5', marginBottom: '0.5em'}}>
                  by {item.user?.username}
                  {item.user?.verified && <span title="Verified" style={{color: '#4fd1c5', marginLeft: '0.3em'}}>✔️</span>}
                </div>
              )}
              {item.code && (
                <div style={{fontSize: '1em', color: '#ccc', marginBottom: '0.5em'}}>
                  <b>Code:</b> {item.code}
                </div>
              )}
              {item.categories && (
                <div style={{fontSize: '0.95em', color: '#bbb'}}>
                  {item.categories.join(', ')}
                </div>
              )}
              {item.definition && (
                <div style={{fontSize: '1em', color: '#bbb', marginTop: '0.5em'}}>
                  {item.definition}
                </div>
              )}
            </a>
          </div>
        ))}
      </div>
    )
  }

  // Render for wiki dictionary (object)
  const renderWikiDict = (dict) => {
    if (!dict || typeof dict !== "object") return null
    return (
      <div style={{
        maxWidth: 800,
        margin: "2em auto",
        background: "#23272f",
        borderRadius: 18,
        color: "#fff",
        padding: 24,
        boxShadow: '0 4px 16px #0004'
      }}>
        <h3 style={{marginBottom: 16, fontWeight: 600}}>Wiki Dictionary</h3>
        <ul style={{columns: 2, fontSize: "1em", listStyle: "none", padding: 0}}>
          {Object.entries(dict).map(([term, def]) => (
            <li key={term} style={{marginBottom: 12}}>
              <b>{term}:</b> {def}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Render for wiki search (array)
  const renderWikiResults = (data) => {
    if (!Array.isArray(data)) return null
    return (
      <div style={{
        maxWidth: 800,
        margin: "2em auto",
        background: "#23272f",
        borderRadius: 18,
        color: "#fff",
        padding: 24,
        boxShadow: '0 4px 16px #0004'
      }}>
        <h3 style={{marginBottom: 16, fontWeight: 600}}>Wiki Search Results</h3>
        <ul style={{fontSize: "1em", listStyle: "none", padding: 0}}>
          {data.map((item, idx) => (
            <li key={item.id || idx} style={{marginBottom: 18}}>
              <b>{item.term || item.title}</b>
              <div style={{marginLeft: 8}}>{item.definition || item.snippet}</div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Android-like input style
  const androidInputStyle = {
    padding: '0.7em 1.1em',
    borderRadius: '12px',
    border: 'none',
    background: '#23272f',
    color: '#fff',
    fontSize: '1.08em',
    minWidth: '180px',
    marginBottom: 4,
    boxShadow: '0 2px 8px #0002',
    outline: 'none'
  }

  // --- HEADER BACKGROUND LOGIC ---
  const isWiki = endpoint === "wiki" || endpoint === "wikidict"
  const showHeader = endpoint === "homepage" || endpoint === "onfire" || endpoint === "user" || endpoint === "filter" || endpoint === "search" || endpoint === "code" || isWiki
  const headerBg = isWiki ? wikiHeaderBg : generalHeaderBg

  // Android app bar style
  const appBarStyle = {
    width: '100%',
    minHeight: 56,
    background: '#23272f',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px #0003',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    padding: '0 1em'
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `url(${pageBg}) repeat`,
        backgroundSize: 'auto',
        padding: 0,
        margin: 0,
        fontFamily: 'Roboto, Arial, sans-serif'
      }}
    >
      {/* Android App Bar */}
      <div style={appBarStyle}>
        <button
          onClick={handleLogoClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginRight: 16,
            outline: 'none'
          }}
          aria-label="Go to homepage"
        >
          <img
            src="https://workshop.codes/assets/logo-small-1327ac6757dbbc86f702bf803fb4100119f0bab88b10c25a1148b59664d7704d.svg"
            className="logo"
            alt="Workshop.codes logo"
            style={{height: '40px'}}
          />
        </button>
        <span style={{fontWeight: 700, fontSize: '1.25em', letterSpacing: 0.5}}>
          Workshop.codes
        </span>
      </div>
      {/* Top angled header */}
      {showHeader && (
        <div
          style={{
            width: '100%',
            minHeight: 180,
            backgroundImage: `url(${headerBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
            position: 'relative',
            zIndex: 1,
            marginBottom: 0
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              marginTop: 0,
              display: 'flex',
              gap: '0.5em',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 32
            }}
          >
            <select value={endpoint} onChange={e => setEndpoint(e.target.value)} style={androidInputStyle}>
              {ENDPOINTS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {renderInputs()}
            {(endpoint !== "homepage" && endpoint !== "onfire" && endpoint !== "wikidict") && (
              <button type="submit" style={{
                padding: '0.7em 1.4em',
                borderRadius: '12px',
                border: 'none',
                background: '#4fd1c5',
                color: '#23272f',
                fontWeight: 'bold',
                fontSize: '1.08em',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002'
              }}>Fetch</button>
            )}
          </form>
        </div>
      )}
      {/* Main content */}
      <div style={{
        maxWidth: 500,
        margin: '0 auto',
        padding: '1.5em 0.5em 0 0.5em'
      }}>
        <h2 style={{
          color: "#fff",
          textShadow: "0 2px 8px #000a",
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1.3em',
          marginBottom: 16
        }}>
          {{
            homepage: "Workshop.codes Homepage",
            onfire: "On Fire",
            search: results ? `Search Results${search ? ` for "${search}"` : ""}` : "Search",
            filter: "Filtered Results",
            user: username ? `Codes by ${username}` : "User Codes",
            code: code ? `Workshop Code: ${code}` : "Individual Code",
            wiki: "Wiki Search",
            wikidict: "Wiki Dictionary"
          }[endpoint]}
        </h2>
        {(searchLoading || loading) && <p style={{color: "#fff", textAlign: 'center'}}>Loading...</p>}
        {(searchError || error) && <p style={{color: 'red', textAlign: 'center'}}>Error: {searchError || error}</p>}
        {(endpoint === "homepage" || endpoint === "onfire" || endpoint === "user" || endpoint === "filter" || endpoint === "search" || endpoint === "code") && displayData && Array.isArray(displayData) && renderCards(displayData)}
        {endpoint === "wiki" && wikiResults && renderWikiResults(wikiResults)}
        {endpoint === "wikidict" && wikiDict && renderWikiDict(wikiDict)}
        {/* Pagination */}
        {(endpoint === "search" || endpoint === "user" || endpoint === "filter") && results && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '2em 0',
            gap: '1em'
          }}>
            <button
              onClick={handlePrevPage}
              disabled={page <= 1}
              style={{
                padding: '0.7em 1.4em',
                borderRadius: '12px',
                border: 'none',
                background: page <= 1 ? '#444' : '#4fd1c5',
                color: '#23272f',
                fontWeight: 'bold',
                fontSize: '1.08em',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px #0002'
              }}
            >Previous</button>
            <span style={{color: '#fff', alignSelf: 'center', fontWeight: 600}}>Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              style={{
                padding: '0.7em 1.4em',
                borderRadius: '12px',
                border: 'none',
                background: !hasMore ? '#444' : '#4fd1c5',
                color: '#23272f',
                fontWeight: 'bold',
                fontSize: '1.08em',
                cursor: !hasMore ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px #0002'
              }}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App