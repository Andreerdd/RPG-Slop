const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');
const { DataTypes, Sequelize } = require('sequelize');

const storage = process.env.DATABASE_PATH || path.join(__dirname, '../database/rpg-slop.sqlite');
fs.mkdirSync(path.dirname(storage), { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Character = sequelize.define('Character', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  attributes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
  appearance: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.STRING(8),
    primaryKey: true,
    defaultValue: () => randomBytes(4).toString('hex').toUpperCase(),
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  lore: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  initialNodeId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

const MapNode = sequelize.define('MapNode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

const MapPath = sequelize.define('MapPath', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fromNodeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  toNodeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  indexes: [{
    unique: true,
    fields: ['fromNodeId', 'toNodeId'],
  }],
});

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('jogador', 'mestre', 'sistema', 'dado', 'npc'),
    allowNull: false,
  },
});

const NPC = sequelize.define('NPC', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  appearance: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  personality: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

User.hasMany(Character, { as: 'characters', foreignKey: { name: 'createdByUserId', allowNull: false }, onDelete: 'CASCADE' });
Character.belongsTo(User, { as: 'creator', foreignKey: { name: 'createdByUserId', allowNull: false } });

User.hasMany(Campaign, { as: 'hostedCampaigns', foreignKey: { name: 'hostUserId', allowNull: false }, onDelete: 'CASCADE' });
Campaign.belongsTo(User, { as: 'host', foreignKey: { name: 'hostUserId', allowNull: false } });

Campaign.hasMany(MapNode, { as: 'nodes', foreignKey: { name: 'campaignId', allowNull: false }, onDelete: 'CASCADE' });
MapNode.belongsTo(Campaign, { as: 'campaign', foreignKey: { name: 'campaignId', allowNull: false } });
Campaign.belongsTo(MapNode, {
  as: 'initialNode',
  foreignKey: 'initialNodeId',
  constraints: false,
});

MapNode.hasMany(MapPath, { as: 'outgoingPaths', foreignKey: { name: 'fromNodeId', allowNull: false }, onDelete: 'CASCADE' });
MapPath.belongsTo(MapNode, { as: 'fromNode', foreignKey: { name: 'fromNodeId', allowNull: false } });
MapNode.hasMany(MapPath, { as: 'incomingPaths', foreignKey: { name: 'toNodeId', allowNull: false }, onDelete: 'CASCADE' });
MapPath.belongsTo(MapNode, { as: 'toNode', foreignKey: { name: 'toNodeId', allowNull: false } });

Campaign.hasMany(NPC, { as: 'npcs', foreignKey: { name: 'campaignId', allowNull: false }, onDelete: 'CASCADE' });
NPC.belongsTo(Campaign, { as: 'campaign', foreignKey: { name: 'campaignId', allowNull: false } });
MapNode.hasMany(NPC, { as: 'npcs', foreignKey: 'nodeId', onDelete: 'SET NULL' });
NPC.belongsTo(MapNode, { as: 'node', foreignKey: 'nodeId' });

Campaign.hasMany(Message, { as: 'messages', foreignKey: { name: 'campaignId', allowNull: false }, onDelete: 'CASCADE' });
Message.belongsTo(Campaign, { as: 'campaign', foreignKey: { name: 'campaignId', allowNull: false } });
Character.hasMany(Message, { as: 'messages', foreignKey: 'characterId', onDelete: 'SET NULL' });
Message.belongsTo(Character, { as: 'character', foreignKey: 'characterId' });

module.exports = {
  sequelize,
  User,
  Character,
  Campaign,
  MapNode,
  MapPath,
  Message,
  NPC,
};
