const { where } = require("sequelize");
const { SLALog, Ticket } = require("../models/index");
const { Op } = require("sequelize");

const checkSlaBreach = async (ticketId) => {
  const slaLog = await SLALog.findOne({ where: { ticket_id: ticketId } });
  if (!slaLog) return false;

  const {
    response_duedate_at,
    resolution_duedate_at,
    response_at,
    resolution_at,
  } = slaLog;

  let isBreached = false;

  const isDateAfter = (actualDate, dueDate) => {
    if (!actualDate || !dueDate) return false;
    return new Date(actualDate) > new Date(dueDate);
  };

  // Helper function to check if due date has passed (for null actual dates)
  const isDueDatePassed = (dueDate) => {
    if (!dueDate) return false;
    return new Date() > new Date(dueDate);
  };
  const is2DaysAfter = () => {
    const d = Date.now();
    const reesponseDueDate = new Date(response_duedate_at);
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    let calc = Date.parse(reesponseDueDate) + day * 2;
    let format = new Date(calc);
    const isAfter2Days = Date.now() > format;
    return isAfter2Days;
  };
  // Check for SLA breaches
  const responseBreached = response_at
    ? isDateAfter(response_at, response_duedate_at) // If response exists, check if it's late
    : isDueDatePassed(response_duedate_at); // If no response, check if due date passed

  const resolutionBreached = resolution_at
    ? isDateAfter(resolution_at, resolution_duedate_at) // If resolution exists, check if it's late
    : isDueDatePassed(resolution_duedate_at); // If no resolution, check if due date passed

  isBreached = responseBreached || resolutionBreached;
  const isClose = is2DaysAfter();
  if (isClose) {
    await Ticket.update(
      { status_id: 17 },
      {
        where: {
          [Op.and]: [{ id: ticketId }, { [Op.not]: [{ status_id: 17 }] }],
        },
      }
    );
  }
  if (isBreached) {
    await SLALog.update(
      { is_breached: isBreached },
      { where: { ticket_id: ticketId } }
    );
  }

  return isBreached;
};

module.exports = checkSlaBreach;
