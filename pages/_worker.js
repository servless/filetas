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
	<title>{{ title }}</title>
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
			<h2>{{ title }}</h2>
			<input type="text" name="fileUrl" placeholder="\u8BF7\u8F93\u5165\u6587\u4EF6\u4E0B\u8F7D\u5730\u5740" />
			<br>
			<button type="submit">\u4E0B\u8F7D</button>
		</form>
	</div>
	<div class="copyright">
		<p class="p-1">
			\xA9 2025 Cloudflare Workers | Powered by <a class="a-1" href="https://forum.idev.top" target="_black">iDEV SIG</a> | Project <a class="a-1" href="https://github.com/servless/cf-filetas" target="_black">cf-filetas</a>
		</p>
	</div>
</body>

</html>
`;

// src/index.ts
var src_default = {
  async fetch(request, env) {
    async function gatherResponse(response) {
      const { headers } = response;
      const contentType = headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return JSON.stringify(await response.json());
      } else if (contentType.includes("application/text")) {
        return response.text();
      } else if (contentType.includes("text/html")) {
        return response.text();
      } else {
        return response.text();
      }
    }
    __name(gatherResponse, "gatherResponse");
    function rawHtmlResponse(html) {
      return new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8"
        }
      });
    }
    __name(rawHtmlResponse, "rawHtmlResponse");
    function setCorsHeaders(response, origin) {
      response = new Response(response.body, response);
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.append("Vary", "Origin");
      return response;
    }
    __name(setCorsHeaders, "setCorsHeaders");
    async function fetchWithOriginHeader(url2) {
      const request2 = new Request(url2);
      request2.headers.set("Origin", new URL(url2).origin);
      return await fetch(url2);
    }
    __name(fetchWithOriginHeader, "fetchWithOriginHeader");
    async function handleRequest(reqUrl) {
      const url2 = new URL(reqUrl);
      let response;
      try {
        url2.protocol = "https:";
        response = await fetchWithOriginHeader(url2.href);
      } catch (e) {
        if (e instanceof TypeError) {
          url2.protocol = "http:";
          response = await fetchWithOriginHeader(url2.href);
        } else {
          throw e;
        }
      }
      response = setCorsHeaders(response, url2.origin);
      return response;
    }
    __name(handleRequest, "handleRequest");
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    const url = new URL(request.url);
    if (env.BASEURL !== "" && env.BASEURL !== url.origin) {
      return Response.redirect(env.BASEURL, 302);
    }
    if (url.pathname === "" || url.pathname === "/") {
      const title = env.TITLE;
      const html = htmlTemplate.replace(/{{ title }}/g, title);
      return rawHtmlResponse(html);
    }
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }
    let redirectUrl = url.pathname.slice(1);
    redirectUrl = decodeURIComponent(redirectUrl);
    const httpReg = /^http?:\/\//;
    const httpsReg = /^https?:\/\//;
    if (redirectUrl.match(httpReg) || redirectUrl.match(httpsReg)) {
      return handleRequest(redirectUrl);
    }
    redirectUrl = redirectUrl.replace(/^\/+/g, "https://");
    if (redirectUrl.match(httpReg) || redirectUrl.match(httpsReg)) {
      return handleRequest(redirectUrl);
    }
    redirectUrl = url.href;
    if (redirectUrl.match(httpReg) || redirectUrl.match(httpsReg)) {
      return handleRequest(redirectUrl);
    }
    return new Response(`request url: ${request.url}`);
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
