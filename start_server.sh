#!/bin/bash
echo "正在启动 FastAPI 服务器..."
echo ""
echo "使用 localhost 配置，确保："
echo "1. 数据库已初始化（运行 python init_db.py）"
echo "2. .env 文件已配置"
echo ""
uvicorn main:app --reload --host 0.0.0.0 --port 8000

