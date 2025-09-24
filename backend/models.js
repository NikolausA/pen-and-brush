const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/db-config.js');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at' 
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at' 
  }
}, {
  tableName: 'Project', 
  timestamps: true
});

const Layer = sequelize.define('Layer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: { 
    type: DataTypes.UUID,
    allowNull: false,
    field: 'project_id' 
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order'
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_visible' 
  },
  opacity: {
    type: DataTypes.FLOAT,
    defaultValue: 100.0,
    field: 'opacity' 
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at' 
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at' 
  }
}, {
  tableName: 'Layer', 
  timestamps: true
});

const History = sequelize.define('History', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'project_id' 
  },
  layerId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'layer_id' 
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at' 
  }
}, {
  tableName: 'History', 
  timestamps: true
});

// Устанавливаем связи
Project.hasMany(Layer, { 
  foreignKey: 'projectId',
  as: 'layers',
  sourceKey: 'id' 
});

Layer.belongsTo(Project, { 
  foreignKey: 'projectId',
  targetKey: 'id' 
});

Project.hasMany(History, { 
  foreignKey: 'projectId',
  as: 'history',
  sourceKey: 'id' 
});

History.belongsTo(Project, { 
  foreignKey: 'projectId',
  targetKey: 'id' 
});

History.belongsTo(Layer, { 
  foreignKey: 'layerId',
  targetKey: 'id' 
});

// Синхронизация только в режиме разработки
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ force: false }).then(() => {
    console.log('Database synchronized');
  }).catch(err => {
    console.error('Sync error:', err);
  });
}

module.exports = { Project, Layer, History, sequelize };