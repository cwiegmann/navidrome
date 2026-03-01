import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Children,
  cloneElement,
  isValidElement,
} from 'react'
import { useListContext, ListContextProvider } from 'react-admin'
import { CircularProgress, makeStyles } from '@material-ui/core'

const useStyles = makeStyles({
  sentinel: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0',
    minHeight: 48,
  },
})

const InfiniteScrollWrapper = ({ children, ...rest }) => {
  const classes = useStyles()
  const context = useListContext()
  const {
    ids,
    data,
    page,
    total,
    setPage,
    loading,
    loaded,
    filterValues,
    currentSort,
  } = context

  const [allIds, setAllIds] = useState([])
  const [allData, setAllData] = useState({})
  const loadedPagesRef = useRef(new Set())
  const highestPageRef = useRef(0)
  const loadingRef = useRef(false)

  const currentKey = useMemo(
    () => JSON.stringify({ f: filterValues, s: currentSort }),
    [filterValues, currentSort],
  )
  const prevKeyRef = useRef('')

  // Keep loadingRef in sync without triggering scroll listener recreation
  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  // Accumulate ids AND data across pages
  useEffect(() => {
    if (currentKey !== prevKeyRef.current) {
      prevKeyRef.current = currentKey
      loadedPagesRef.current = new Set()
      highestPageRef.current = 0

      if (ids && ids.length > 0) {
        loadedPagesRef.current.add(page)
        highestPageRef.current = page
        const newData = {}
        ids.forEach((id) => {
          if (data[id]) newData[id] = data[id]
        })
        setAllIds([...ids])
        setAllData(newData)
      } else {
        setAllIds([])
        setAllData({})
      }
      return
    }

    if (!ids || ids.length === 0) return
    if (loadedPagesRef.current.has(page)) {
      if (page === 1 && loadedPagesRef.current.size === 1) {
        const newData = {}
        ids.forEach((id) => {
          if (data[id]) newData[id] = data[id]
        })
        setAllIds([...ids])
        setAllData(newData)
      }
      return
    }

    loadedPagesRef.current.add(page)
    if (page > highestPageRef.current) {
      highestPageRef.current = page
    }

    if (page === 1) {
      const newData = {}
      ids.forEach((id) => {
        if (data[id]) newData[id] = data[id]
      })
      setAllIds([...ids])
      setAllData(newData)
    } else {
      setAllIds((prev) => {
        const existing = new Set(prev)
        const newIds = ids.filter((id) => !existing.has(id))
        if (newIds.length === 0) return prev
        return [...prev, ...newIds]
      })
      setAllData((prev) => {
        const next = { ...prev }
        ids.forEach((id) => {
          if (data[id]) next[id] = data[id]
        })
        return next
      })
    }
  }, [ids, data, page, currentKey])

  const hasMore = total != null && total > 0 && allIds.length < total
  const hasMoreRef = useRef(hasMore)
  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  const setPageRef = useRef(setPage)
  useEffect(() => {
    setPageRef.current = setPage
  }, [setPage])

  // loadMore uses only refs — never causes scroll listener recreation
  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return
    loadingRef.current = true
    const nextPage = highestPageRef.current + 1
    setPageRef.current(nextPage)
  }, [])

  // Scroll detection — stable deps, no teardown/recreation on loading changes
  useEffect(() => {
    let ticking = false

    const check = () => {
      ticking = false
      if (loadingRef.current || !hasMoreRef.current) return

      const scrollEl = document.scrollingElement || document.documentElement
      const scrollTop = scrollEl.scrollTop
      const scrollHeight = scrollEl.scrollHeight
      const clientHeight = scrollEl.clientHeight

      const contentShorterThanViewport = scrollHeight <= clientHeight + 50
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 600

      if (contentShorterThanViewport || nearBottom) {
        loadMore()
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(check)
      }
    }

    // Auto-load if content is shorter than viewport
    const autoLoadTimer = setTimeout(check, 500)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      clearTimeout(autoLoadTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [loadMore])

  // Re-check after new data arrives (content may still be short)
  useEffect(() => {
    if (!loading && allIds.length > 0 && hasMore) {
      const timer = setTimeout(() => {
        if (loadingRef.current) return
        const scrollEl = document.scrollingElement || document.documentElement
        if (
          scrollEl.scrollHeight <= scrollEl.clientHeight + 50 ||
          scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 600
        ) {
          loadMore()
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [loading, allIds.length, hasMore, loadMore])

  const modifiedContext = useMemo(
    () => ({ ...context, ids: allIds, data: allData }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allIds, allData, context.total, context.loading, context.loaded, context.page],
  )

  return (
    <ListContextProvider value={modifiedContext}>
      {Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(child, { ...rest, ids: allIds, data: allData, loaded, loading })
          : child,
      )}
      {hasMore && (
        <div className={classes.sentinel}>
          <CircularProgress size={24} />
        </div>
      )}
    </ListContextProvider>
  )
}

export { InfiniteScrollWrapper }
export default InfiniteScrollWrapper
