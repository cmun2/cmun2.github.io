import { FullSlug, isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"

export type SortFn = (f1: QuartzPluginData, f2: QuartzPluginData) => number

export function byDateAndAlphabetical(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

export function byDateAndAlphabeticalFolderFirst(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort folders first
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")
    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    // If both are folders or both are files, sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

type Props = {
  limit?: number
  sort?: SortFn
} & QuartzComponentProps

/**
 * The folder a post sits in, which is the only category this vault actually has.
 * Slugs look like `ko/engineering/network-sse`: the locale is the first segment and
 * the category the second. A post at the root of a locale has none, and gets no chip
 * rather than an empty one.
 */
function categoryOf(slug: string): string | null {
  const parts = slug.split("/")
  return parts.length >= 3 ? parts[1] : null
}

/** YYYY.MM.DD -- a ledger wants a date that sorts by eye, not "Sep 13, 2026". */
function ledgerDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

export const PageList: QuartzComponent = ({ cfg, fileData, allFiles, limit, sort }: Props) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst(cfg)
  let list = allFiles.sort(sorter)
  if (limit) {
    list = list.slice(0, limit)
  }

  const cats = new Set(list.map((p) => categoryOf(p.slug ?? "")).filter(Boolean))
  const showCategory = cats.size > 1

  return (
    <ol class="ledger">
      {list.map((page, i) => {
        const title = page.frontmatter?.title
        const tags = page.frontmatter?.tags ?? []
        // Inside a folder every row has the same category, so the chip would be the
        // darkest thing on the page while carrying no information. It only earns its
        // place where the list actually mixes categories -- a locale index, a tag page.
        const cat = showCategory ? categoryOf(page.slug ?? "") : null
        const date = page.dates ? getDate(cfg, page) : undefined
        const href = resolveRelative(fileData.slug!, page.slug!)

        return (
          <li class="led-row" style={`--row: ${i}`}>
            <span class="led-n" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div class="led-main">
              <a href={href} class="led-title internal">
                {title}
              </a>
              <div class="led-meta">
                {cat && <span class="led-cat">{cat}</span>}
                {date && <time datetime={date.toISOString()}>{ledgerDate(date)}</time>}
                {tags.length > 0 && (
                  <span class="led-tags">
                    {tags.map((tag) => (
                      <a
                        class="internal tag-link"
                        href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                      >
                        {tag}
                      </a>
                    ))}
                  </span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

PageList.css = `
.ledger { list-style: none; margin: 0; padding: 0; }
`
