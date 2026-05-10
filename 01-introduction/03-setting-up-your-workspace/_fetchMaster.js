await fetch(
  "https://vod-akm.play.hotmart.com/video/aZ88JBjNZp/hls/master-pkg-t-1769628973000.m3u8?hdnts=st%3D1778423668%7Eexp%3D1778424168%7Ehmac%3D3968ad2ffc844d3cd1b8279f2a60b6e846c968448f2a516d861efbf88ab4385d&app=aa2d356b-e2f0-45e8-9725-e0efc7b5d29c",
  {
    credentials: "omit",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "Sec-GPC": "1",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
    },
    referrer: "https://player.hotmart.com/",
    method: "GET",
    mode: "cors",
  },
);
