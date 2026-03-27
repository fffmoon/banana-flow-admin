from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Text
from datetime import datetime
from decimal import Decimal
from app.core.database import Base


class DeviceInfoEntity(Base):
    __tablename__ = "device_info"

    id = Column(Integer, primary_key=True, index=True, comment="主键ID")
    device_id = Column(String(50), nullable=False, index=True, comment="设备编号")
    device_name = Column(String(100), nullable=False, comment="设备名称")
    device_type = Column(String(50), comment="设备类型")
    status = Column(
        String(20), nullable=False, index=True, comment="设备状态:运行/停机/报警/维护"
    )
    alarm_level = Column(String(20), comment="报警级别:无/低/中/高")
    alarm_info = Column(Text, comment="报警详情")
    temperature = Column(DECIMAL(5, 2), comment="温度(℃)")
    humidity = Column(DECIMAL(5, 2), comment="湿度(%)")
    pressure = Column(DECIMAL(6, 2), comment="压力(MPa)")
    voltage = Column(DECIMAL(6, 2), comment="电压(V)")
    current = Column(DECIMAL(6, 2), comment="电流(A)")
    vibration = Column(DECIMAL(6, 2), comment="振动值(mm/s)")
    production_count = Column(Integer, default=0, comment="生产计数")
    energy_consumption = Column(DECIMAL(8, 2), comment="能耗(kWh)")
    record_time = Column(
        DateTime, nullable=False, index=True, default=datetime.now, comment="记录时间"
    )
    operator = Column(String(50), comment="操作员")
    workshop = Column(String(50), index=True, comment="车间")
    remarks = Column(Text, comment="备注")

    def __repr__(self):
        return f"<DeviceInfoEntity(device_id='{self.device_id}', device_name='{self.device_name}', status='{self.status}')>"
