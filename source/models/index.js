const User = require("./users_model");
const Role = require("./role_model");
const Category = require("./category_model");
const Priority = require("./priority_model");
const Status = require("./status_model");
const Sla = require("./sla_model");
const Ticket = require("./ticket_model");
const Comments = require("./comments_model");
const SLALog = require("./sla_logs_model");
const TicketLog = require("./ticket_logs_model");
const Attachment = require("./attachment_model");


User.belongsTo(Role, { foreignKey: "role_id", as: "role" }); // relasi user ke role
User.hasMany(Comments, { foreignKey: "user_id", as: "user" });

Role.hasMany(User, { foreignKey: "role_id", as: "users" });

Category.hasMany(Sla, { foreignKey: "category_id", as: "sla" });

Sla.belongsTo(Priority, { foreignKey: "priority_id", as: "priority" });
Sla.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Sla.hasMany(SLALog, { foreignKey: "sla_id" });

Ticket.belongsTo(Sla, { foreignKey: "sla_id", as: "sla" });
Ticket.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Ticket.belongsTo(Priority, { foreignKey: "priority_id", as: "priority" });
Ticket.belongsTo(Status, { foreignKey: "status_id", as: "status" });
Ticket.belongsTo(User, { as: "user", foreignKey: "user_id" });
Ticket.belongsTo(User, { as: "agent", foreignKey: "agent_id" });
Ticket.hasMany(Comments, { as: "comments", foreignKey: "ticket_id" });
Ticket.hasMany(SLALog, { foreignKey: "ticket_id", as: "sla_logs" });
Ticket.hasMany(TicketLog, { foreignKey: "ticket_id", as: "logs" });
Ticket.hasMany(Attachment, { foreignKey: 'ticket_id', as: 'attachments' });

Comments.belongsTo(Ticket, { foreignKey: "ticket_id" });
Comments.belongsTo(User, { foreignKey: "user_id", as:"user"});

SLALog.belongsTo(Sla, { foreignKey: "sla_id", as: "sla" });
SLALog.belongsTo(Ticket, { foreignKey: "ticket_id", as: "ticket" });

Attachment.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
Attachment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


module.exports = {
  User,
  Role,
  Category,
  Priority,
  Status,
  Sla,
  Ticket,
  Comments,
  SLALog,
  TicketLog,
  Attachment,
  Role
};
