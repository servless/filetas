export const htmlTemplate = `
<!DOCTYPE html>
<html>

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="author" content="Jetsung Chan">
	<title>文件加速</title>
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
			// 编码 fileUrl
			const encodedFileUrl = encodeURIComponent(fileUrlInput.value);
			const reqUrl = location.origin + '/' + encodedFileUrl

			window.open(reqUrl)
			// location.href = reqUrl
			return false
		}
	</script>
</head>

<body>
	<div class="container">
		<form class="form" id="downloadForm" method="GET" onsubmit="toSubmit(event)">
			<h2>下载加速</h2>
			<input type="text" name="fileUrl" placeholder="请输入文件下载地址" />
			<br>
			<button type="submit">下载</button>
		</form>
	</div>
	<div class="copyright">
		<p class="p-1">
			© 2025 Cloudflare Workers | Powered by <a class="a-1" href="https://forum.idev.top" target="_black">iDEV SIG</a> | Project <a class="a-1" href="https://github.com/servless/filetas" target="_black">filetas</a>
		</p>
	</div>
</body>

</html>
`
