const IPFS_URI_PATTERN = /^ipfs:\/\/[a-zA-Z0-9]+(?:\/[a-zA-Z0-9._~!$&'()*+,;=:@%/-]*)?$/;

export const getProofHref = (uri: string): string | undefined => {
  if (IPFS_URI_PATTERN.test(uri)) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  try {
    const url = new URL(uri);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
};
