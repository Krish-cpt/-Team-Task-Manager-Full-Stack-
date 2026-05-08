const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '../database.sqlite'),
  logging: false,
});

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'member'), defaultValue: 'member' },
  avatar: { type: DataTypes.STRING, defaultValue: null },
}, { timestamps: true });

// Project Model
const Project = sequelize.define('Project', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('active', 'completed', 'archived'), defaultValue: 'active' },
  color: { type: DataTypes.STRING, defaultValue: '#6366f1' },
  dueDate: { type: DataTypes.DATEONLY },
}, { timestamps: true });

// Task Model
const Task = sequelize.define('Task', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('todo', 'in_progress', 'review', 'done'), defaultValue: 'todo' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
  dueDate: { type: DataTypes.DATEONLY },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

// ProjectMember (join table with role)
const ProjectMember = sequelize.define('ProjectMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  role: { type: DataTypes.ENUM('owner', 'admin', 'member'), defaultValue: 'member' },
}, { timestamps: true });

// Associations
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId', as: 'projects' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId', as: 'members' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

User.hasMany(Task, { foreignKey: 'creatorId', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'projectMembers' });
User.hasMany(ProjectMember, { foreignKey: 'userId' });

module.exports = { sequelize, User, Project, Task, ProjectMember };
