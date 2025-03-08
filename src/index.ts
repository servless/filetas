import { htmlTemplate } from './template'

// 匹配 GitHub
const regexPatterns = {
	releases: /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:releases|archive)\/.*$/i,
	blobRaw: /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:blob|raw)\/.*$/i,
	infoGit: /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:info|git-).*$/i,
	rawContent: /^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+?\/.+$/i,
	gist: /^(?:https?:\/\/)?gist\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+$/i,
	tags: /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/tags.*$/i
}

// 跨域请求头
const corsHeaders = (origin: string = '*') => ({
	"Access-Control-Allow-Origin": origin,
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Max-Age": "86400",
});

// 返回 HTML 模板头部标识
const rawHtmlResponse = (html: string): Response => {
	return new Response(html, {
		headers: {
			'content-type': 'text/html;charset=UTF-8',
		},
	})
}

// 判断域名合法性
const isDomain = (url: string): boolean => {
	try {
		const hostname = new URL(url).hostname;
		return hostname.includes('.');
	} catch (e) {
		return false;
	}
}

// 处理请求选项
const handleOptions = (request: Request): Response => {
	if (
		request.headers.get("Origin") !== null &&
		request.headers.get("Access-Control-Request-Method") !== null &&
		request.headers.get("Access-Control-Request-Headers") !== null
	) {
		// Handle CORS preflight requests.
		return new Response(null, {
			headers: {
				...corsHeaders,
				"Access-Control-Allow-Headers": request.headers.get(
					"Access-Control-Request-Headers",
				) || "",
			},
		});
	} else {
		// Handle standard OPTIONS request.
		return new Response(null, {
			headers: {
				Allow: "GET, HEAD, POST, OPTIONS",
			},
		});
	}
}

// 处理请求
const handleRequest = async (reqUrl: string, request: Request): Promise<Response> =>  {
	const reqAttrs: RequestInit = {
		method: request.method,
		headers:  new Headers(request.headers),
		redirect: "manual", // manual, *follow, error
		body: request.body,
	}
	const reqURL = new URL(reqUrl);
	return proxyRequest(reqURL, reqAttrs);
	// request = new Request(reqUrl, request);
	// request.headers.set("Origin", new URL(reqUrl).origin);
	// return new Response(`request url2: ${JSON.stringify(request.headers)}`)

	// let response = await fetch(request);
	// response = new Response(response.body, response);
	// response.headers.set("Access-Control-Allow-Origin", url.origin);
	// // Append to/Add Vary header so browser will cache response correctly
	// response.headers.append("Vary", "Origin");

	// return response;
}

// 代理请求
const proxyRequest = async (reqURL: URL, reqAttrs: RequestInit): Promise<Response> => {
	const response = await fetch(reqURL.href, reqAttrs);
	const oldHeaders = response.headers;
	const newHeaders = new Headers(oldHeaders);

	if (newHeaders.has("location")) {
		const location = newHeaders.get("location");
		if (location === null) {
			return new Response("Location header is null", { status: 500 });
		}
		// newHeaders.set("location", location);
		reqAttrs.redirect = "follow";
		return proxyRequest(new URL(location), reqAttrs);
		// newHeaders.set("location", location);
	}
	// return new Response(reqURL.href, {status: 200})

	// 处理响应头
	newHeaders.set("Access-Control-Expose-Headers", "*");
	newHeaders.set("Access-Control-Allow-Origin", "*");

	// newHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");

	newHeaders.delete("Content-Security-Policy");
	newHeaders.delete("Content-Security-Policy-Report-Only");
	newHeaders.delete("Clear-Site-Data");
	// newHeaders.delete("Feature-Policy");
	// newHeaders.delete("Permissions-Policy");

	return new Response(response.body, {
		status: response.status,
		// statusText: response.statusText,
		headers: newHeaders,
	});
}

// 处理请求
const httpRequest = (reqUrl: string, request: Request, deployURL: string = ''): Promise<Response> =>  {
	if (regexPatterns.releases.test(reqUrl) || regexPatterns.gist.test(reqUrl) || regexPatterns.tags.test(reqUrl) || regexPatterns.infoGit.test(reqUrl) || regexPatterns.rawContent.test(reqUrl)) {
		return handleRequest(reqUrl, request)
	} else if (regexPatterns.blobRaw.test(reqUrl)) {
					reqUrl = reqUrl.replace('/blob/', '/raw/')
					return handleRequest(reqUrl, request)
	} else {
			return fetch((deployURL ?  deployURL + '/' : '') + reqUrl);
	}
}

// 执行请求
// https://developers.cloudflare.com/workers/examples/cors-header-proxy/
const doRequest = async (reqUrl: string, request: Request): Promise<Response> => {
	if (request.method === "OPTIONS") {
		// Handle CORS preflight requests
		return handleOptions(request);
	}

	const allowedMethods = ["GET", "HEAD", "POST"];
	if (!allowedMethods.includes(request.method)) {
		return new Response("Method Not Allowed", { status: 405 });
	}

	// Handle requests to the API server
	return httpRequest(reqUrl, request);
}

// 入口函数
const entry = async (request: Request): Promise<Response> => {
	// // 只允许 GET 请求
	// if (request.method !== 'GET') {
	// 	return new Response('Method Not Allowed', { status: 405 })
	// }

	// 获取请求的 URL
	const url = new URL(request.url)
	// const deployURL = url.origin;
	const deployURL = '';

	// 设置网页标题
	if (url.pathname === '' || url.pathname === '/') {
		return rawHtmlResponse(htmlTemplate)
	}

	// 网站图标
	if (url.pathname === '/favicon.ico') {
		return new Response(null, { status: 204 })
	}

	// console.log('href:', url.href);
	// console.log('origin:', url.origin);
	// console.log('protocol:', url.protocol);
	// console.log('username:', url.username);
	// console.log('password:', url.password);
	// console.log('host:', url.host);
	// console.log('hostname:', url.hostname);
	// console.log('port:', url.port);
	// console.log('pathname:', url.pathname);
	// console.log('search:', url.search);
	// console.log('hash:', url.hash);

	// 取出网址
	let redirectUrl = url.pathname.slice(1) + url.search + url.hash;
	// console.log('reqUrl', redirectUrl)

	// 解码 encodedFileUrl
	redirectUrl = decodeURIComponent(redirectUrl);
	// console.log('reqUrl', redirectUrl)

	// 正则匹配
	const httpHttpsReg = /^https?:\/\//;

	// 去除多余的斜杠
	// https://xx.com////https://xx.com/x.zip
	redirectUrl = redirectUrl.replace(/\/+https?:\/\/+/g, 'https://');

	// https://xx.com/https://xx.com/x.zip
	if (redirectUrl.match(httpHttpsReg)) {
			// return new Response(` request url 1: ${redirectUrl}`)
			return doRequest(redirectUrl, request)
	}

	// 网站内页，有 Referer
	// https://xx.com/xx.com/hello.git
	if (request.headers.has('referer')) {
		const referer = request.headers.get('referer')
		if (referer === null) {
			return new Response('Referer header is null', { status: 500 });
		}
		const siteURL = referer.replace(deployURL + '/', '');
		const originURL = new URL(siteURL).origin;
		request.headers.set('origin', originURL);
		request.headers.set('referer', originURL);
		// return new Response(`request url: ${originURL}/${redirectUrl}`)
		return doRequest(originURL + '/' + redirectUrl, request);
	}

	// 去除多余的斜杠和补充协议
	// https://xx.com/xx.com/x.zip
	redirectUrl = redirectUrl.replace(/^\/+/g, '')
	if (isDomain(redirectUrl.split('/')[0])) {
		return doRequest('https://' + redirectUrl, request)
	}

	return new Response('Invalid URL', { status: 400 });
}

export default {
	async fetch(request: Request): Promise<Response> {
		return entry(request);
	},
};

// addEventListener('fetch', (event) => {
// 	const fetchEvent = event as FetchEvent;
// 	const ret = entry(fetchEvent.request).catch(err => {
// 		console.error(err)
// 		const headers = {
// 			"Access-Control-Allow-Origin": "*",
// 		}
// 		return new Response('Internal Server Error: ' + err.stack, { status: 500, headers})
// 	})
// 	fetchEvent.respondWith(ret)
// })
