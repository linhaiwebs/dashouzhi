import json
import asyncio
import httpx
from bs4 import BeautifulSoup
import re
from typing import List, Tuple

BASE_URL = 'https://kabutan.jp/stock/kabuka?code={code}'

def _clean_text(text: str) -> str:
    return text.replace(' ', '').replace('\n', '').strip()

def _parse_table(soup: BeautifulSoup, table_class: str, skip_header: bool = False) -> List[List[str]]:
    """
    通用表格解析函数，用于解析指定表格的内容。
    :param soup: BeautifulSoup 对象
    :param table_class: 表格的 CSS 类选择器
    :param skip_header: 是否跳过表格的标题行
    :return: 表格数据的二维数组
    """
    data = []
    table_rows = soup.select(f'.{table_class} tr')
    if skip_header:
        table_rows = table_rows[1:]  # 跳过标题行
    for row in table_rows:
        cells = row.find_all(['td', 'th'])
        data.append([_clean_text(cell.text) for cell in cells])
    return data

def _parse_title(soup: BeautifulSoup) -> Tuple[str, str]:
    h2_tag = soup.find('h2')
    if h2_tag and h2_tag.text:
        match = re.match(r'(\d+)\s+(.+)', h2_tag.text.strip())
        if match:
            return match.group(1), match.group(2)
    return "N/A", "N/A"

def _parse_company_image(soup: BeautifulSoup) -> str:
    image_tag = soup.select_one('div#chc_3_1.ch_sz1 img')
    if image_tag and image_tag.get('src'):
        return image_tag['src'].strip()
    return "N/A"

async def get_price_data(code: str) -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(BASE_URL.format(code=code), timeout=10)
            response.raise_for_status()
        except (httpx.RequestError, httpx.HTTPStatusError):
            return {
                "msg": "リクエストに失敗しました。",
                "code": -1,
                "data": {}
            }

    soup = BeautifulSoup(response.text, 'html.parser')

    company_image_url = _parse_company_image(soup)
    price_chart_data = _parse_table(soup, 'stock_kabuka0', skip_header=True)  # 跳过标题行
    dwm_table_data = _parse_table(soup, 'stock_kabuka_dwm')  # 类选择器
    symbol, name = _parse_title(soup)

    return {
        "msg": "success",
        "code": 200,
        "data": {
            "companyName": name,
            "companyImage": company_image_url,
            "symbol": symbol,
            "data": price_chart_data,
            "info": dwm_table_data
        }
    }

async def get_today_price_data_json(code: str) -> str:
    data = await get_price_data(code)
    return json.dumps(data, ensure_ascii=False, indent=4)

def main():
    code = input("株式コードを入力してください: ")
    result_json = asyncio.run(get_today_price_data_json(code))
    print(result_json)

if __name__ == '__main__':
    main()