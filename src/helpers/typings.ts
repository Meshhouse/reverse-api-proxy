export function isDownloadLink(link: SFMLabLink[] | Error): link is SFMLabLink[] {
  return (link as SFMLabLink[]).length !== undefined;
}
