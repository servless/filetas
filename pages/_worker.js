var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/template.ts
var htmlTemplate = `
<!DOCTYPE html>
<html>

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="author" content="Jetsung Chan">
	<title>\u6587\u4EF6\u52A0\u901F</title>
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
			background-color: #f4f4f4;
			font-family: Arial, Helvetica, sans-serif;
		}

		.container {
			position: absolute;
			top: calc(50% - 10rem);
			left: 50%;
			transform: translate(-50%, -50%);
			width: 96%;
			max-width: 640px;
		}

		.form {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			border: 1px solid #ddd;
			border-radius: 10px;
			padding: 20px;
			background-color: #fff;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		}

		.form h2 {
			margin-bottom: 20px;
			text-align: center;
		}

		.form input[type="text"] {
			width: 100%;
			padding: 10px;
			margin-bottom: 20px;
			border: 1px solid #ddd;
			border-radius: 5px;
			font-size: 16px;
			outline: none;
		}

		.form button[type="submit"] {
			padding: 10px 20px;
			background-color: #4caf50;
			color: #fff;
			border: none;
			border-radius: 5px;
			font-size: 16px;
			cursor: pointer;
		}

		.form button[type="submit"]:hover {
			background-color: #3e8e41;
		}

		.copyright {
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			margin-bottom: 10px;
			font-size: 14px;
			color: #999;
		}

		.a-1 {
			font-weight: bolder;
		}

		.p-1 a:hover,
		.p-1 a:link,
		.p-1 a:visited,
		.p-1 a:active {
			text-decoration: none;
		}

		.p-1 a:hover {
			color: #055905;
		}
	</style>
	<script>
		function toSubmit (e) {
			e.preventDefault()
			const fileUrlInput = downloadForm.querySelector('input[name="fileUrl"]')
			// \u7F16\u7801 fileUrl
			const encodedFileUrl = encodeURIComponent(fileUrlInput.value);
			const reqUrl = location.origin + '/' + encodedFileUrl

			window.open(reqUrl)
			// location.href = reqUrl
			return false
		}
	<\/script>
</head>

<body>
	<div class="container">
		<form class="form" id="downloadForm" method="GET" onsubmit="toSubmit(event)">
			<h2>\u4E0B\u8F7D\u52A0\u901F</h2>
			<input type="text" name="fileUrl" placeholder="\u8BF7\u8F93\u5165\u6587\u4EF6\u4E0B\u8F7D\u5730\u5740" />
			<br>
			<button type="submit">\u4E0B\u8F7D</button>
		</form>
	</div>
	<div class="copyright">
		<p class="p-1">
			\xA9 2025 Cloudflare Workers  | Powered by <a class="a-1" href="https://forum.idev.top" target="_black">iDEV SIG</a> | Project <a class="a-1" href="https://github.com/servless/filetas" target="_black">filetas</a>
		</p>
	</div>
</body>

</html>
`;

// src/index.ts
var regexPatterns = {
  releases: /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:releases|archive)\/.*$/i,
  blobRaw: /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:blob|raw)\/.*$/i,
  infoGit: /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:info|git-).*$/i,
  rawContent: /^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+?\/.+$/i,
  gist: /^(?:https?:\/\/)?gist\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+$/i,
  tags: /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/tags.*$/i
};
var corsHeaders = /* @__PURE__ */ __name((origin = "*") => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400"
}), "corsHeaders");
var rawHtmlResponse = /* @__PURE__ */ __name((html) => {
  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8"
    }
  });
}, "rawHtmlResponse");
var isDomain = /* @__PURE__ */ __name((url) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.includes(".");
  } catch (e) {
    return false;
  }
}, "isDomain");
var handleOptions = /* @__PURE__ */ __name((request) => {
  if (request.headers.get("Origin") !== null && request.headers.get("Access-Control-Request-Method") !== null && request.headers.get("Access-Control-Request-Headers") !== null) {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Headers": request.headers.get(
          "Access-Control-Request-Headers"
        ) || ""
      }
    });
  } else {
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS"
      }
    });
  }
}, "handleOptions");
var handleRequest = /* @__PURE__ */ __name(async (reqUrl, request) => {
  const reqAttrs = {
    method: request.method,
    headers: new Headers(request.headers),
    redirect: "manual",
    // manual, *follow, error
    body: request.body
  };
  const reqURL = new URL(reqUrl);
  return proxyRequest(reqURL, reqAttrs);
}, "handleRequest");
var proxyRequest = /* @__PURE__ */ __name(async (reqURL, reqAttrs) => {
  const response = await fetch(reqURL.href, reqAttrs);
  const oldHeaders = response.headers;
  const newHeaders = new Headers(oldHeaders);
  if (newHeaders.has("location")) {
    const location = newHeaders.get("location");
    if (location === null) {
      return new Response("Location header is null", { status: 500 });
    }
    reqAttrs.redirect = "follow";
    return proxyRequest(new URL(location), reqAttrs);
  }
  newHeaders.set("Access-Control-Expose-Headers", "*");
  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.delete("Content-Security-Policy");
  newHeaders.delete("Content-Security-Policy-Report-Only");
  newHeaders.delete("Clear-Site-Data");
  return new Response(response.body, {
    status: response.status,
    // statusText: response.statusText,
    headers: newHeaders
  });
}, "proxyRequest");
var httpRequest = /* @__PURE__ */ __name((reqUrl, request, deployURL = "") => {
  if (regexPatterns.releases.test(reqUrl) || regexPatterns.gist.test(reqUrl) || regexPatterns.tags.test(reqUrl) || regexPatterns.infoGit.test(reqUrl) || regexPatterns.rawContent.test(reqUrl)) {
    return handleRequest(reqUrl, request);
  } else if (regexPatterns.blobRaw.test(reqUrl)) {
    reqUrl = reqUrl.replace("/blob/", "/raw/");
    return handleRequest(reqUrl, request);
  } else {
    const newURL = new URL(deployURL ? deployURL + "/" : "" + reqUrl);
    const newHeaders = new Headers();
    newHeaders.set("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36");
    const reqAttrs = {
      method: request.method,
      headers: newHeaders,
      redirect: "manual",
      // manual, *follow, error
      body: request.body
    };
    return fetch(newURL, reqAttrs);
  }
}, "httpRequest");
var doRequest = /* @__PURE__ */ __name(async (reqUrl, request) => {
  console.log(request.method, reqUrl);
  if (request.method === "OPTIONS") {
    return handleOptions(request);
  }
  const allowedMethods = ["GET", "HEAD", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return new Response("Method Not Allowed", { status: 405 });
  }
  return httpRequest(reqUrl, request);
}, "doRequest");
var entry = /* @__PURE__ */ __name(async (request) => {
  const url = new URL(request.url);
  const deployURL = "";
  if (url.pathname === "" || url.pathname === "/") {
    return rawHtmlResponse(htmlTemplate);
  }
  if (url.pathname === "/favicon.ico") {
    return new Response(null, { status: 204 });
  }
  let redirectUrl = url.pathname.slice(1) + url.search + url.hash;
  redirectUrl = decodeURIComponent(redirectUrl);
  const httpHttpsReg = /^https?:\/\//;
  redirectUrl = redirectUrl.replace(/\/+https?:\/\/+/g, "https://");
  if (redirectUrl.match(httpHttpsReg)) {
    return doRequest(redirectUrl, request);
  }
  if (request.headers.has("referer")) {
    const referer = request.headers.get("referer");
    if (referer === null) {
      return new Response("Referer header is null", { status: 500 });
    }
    const siteURL = referer.replace(deployURL + "/", "");
    const originURL = new URL(siteURL).origin;
    request.headers.set("origin", originURL);
    request.headers.set("referer", originURL);
    return doRequest(originURL + "/" + redirectUrl, request);
  }
  redirectUrl = redirectUrl.replace(/^\/+/g, "");
  if (isDomain(redirectUrl.split("/")[0])) {
    return doRequest("https://" + redirectUrl, request);
  }
  return new Response("Invalid URL", { status: 400 });
}, "entry");
var src_default = {
  async fetch(request) {
    return entry(request);
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
