# Team Project API

基于 FastAPI 的群组任务管理后端API

## 技术栈

- FastAPI
- PostgreSQL
- SQLAlchemy
- Uvicorn

## 项目结构

```
TeamProject/
├── app/
│   ├── __init__.py
│   ├── config.py          # 配置文件
│   ├── database.py        # 数据库连接
│   ├── models/            # 数据模型
│   ├── routers/           # API 路由
│   └── schemas/           # Pydantic 模式
├── main.py                # 应用入口
├── requirements.txt       # 依赖列表
├── .env.example          # 环境变量示例
└── README.md
```

## 快速开始

###  安装依赖

```bash
pip install -r requirements.txt
```



###  运行应用

```bash
# 开发模式
uvicorn main:app --reload

# 或直接运行
python main.py
```

###  访问API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 端点

- `GET /` - 根路径
- `GET /health` - 健康检查

## 开发说明

- 路由定义在 `app/routers/` 目录
- 数据模型定义在 `app/models/` 目录
- Pydantic 模式定义在 `app/schemas/` 目录
- 数据库配置在 `app/config.py`


