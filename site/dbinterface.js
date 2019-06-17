var sqlite = require("sqlite");

//https://stackoverflow.com/questions/603572/escape-single-quote-character-for-use-in-an-sqlite-query
export function escape_sql(text) {
  var result = text;
  result = result.replace(/\'/g,"''"); //Removes single quotes 
  return result;
}

export function hello() {
  return "Hello";
}

export async function writeCandidate(callback, full_name, location, testimonial, image_profile, image_background) {

  // let writeBill = "INSERT INTO `candidates` (`full_name`, 'location', 'testimonial', 'image_profile', 'image_background') VALUES ('" + full_name + "', '" + location + "', '" + testimonial + "', '" + image_profile + "', '" + image_background + "')"
  let writeBill = "INSERT INTO candidates (full_name, location, testimonial, image_profile, image_background) VALUES (?, ?, ?, ?, ?)"
  var db = await sqlite.open("./db.sqlite");
  var user_result = await db.all(writeBill, [full_name, location, testimonial, image_profile, image_background]);

  callback();

}

export async function writeBill(callback, title, summary, type, text_link, bulleted_list, date) {

  // let writeBill = "INSERT INTO `bills` (`title`, 'summary', 'type', 'text_link', 'bulleted_list', 'date') VALUES ('" + escape_sql(title) + "', '" + escape_sql(summary) + "', '" + escape_sql(type) + "', '" + escape_sql(text_link) + "', '" + escape_sql(bulleted_list) + "', '" + escape_sql(date) + "')"
  let writeBill = "INSERT INTO bills (title, summary, type, text_link, bulleted_list, date) VALUES (?, ?, ?, ?, ?, ?)"
  var db = await sqlite.open("./db.sqlite");
  var user_result = await db.all(writeBill, [title, summary, type, text_link, bulleted_list, date]);

  callback();

}

export async function writeAnnouncement(callback, html) {

  let writeHtml = 'INSERT INTO announcements (html) VALUES (?)'
  var db = await sqlite.open("./db.sqlite");
  var user_result = await db.all(writeHtml, [html]);

  callback();

}

export async function isAdministrator(callback, user_id) {

  let getUserQuery = 'SELECT * FROM administrators WHERE user_id = ?'
  
  var db = await sqlite.open("./db.sqlite");
  var user_result = await db.all(getUserQuery, [user_id]);

  callback(user_result.length > 0);

}


export async function UserArgumentSubmit(callback, user_id, vote_id, for_against, argument) {

  try {

    let getUserQuery = "SELECT * FROM authentication WHERE id = ?"
    var db = await sqlite.open("./db.sqlite");
    var user_result = await db.all(getUserQuery, [user_id]);
    let writeArgumentQuery = "INSERT INTO `bills_arguments` (`bill_id`, `name`, `occupation`, `occupation_location`, `image_url`, `comment`, `for_against`) VALUES ('" + vote_id + "', '" + user_result[0].name + "', '" + user_result[0].occupation + "', '" +user_result[0].occupation_location + "', '" + user_result[0].profile_image + "', '" + escape_sql(argument) + "', '" + for_against + "')"
    var argument_result = await db.all(writeArgumentQuery);

    callback();

  } catch (err) {
    console.log(err)
  }
}

export async function UserVoteArg(callback, user_id, arg_id, toggle) {


  var db = await sqlite.open("./db.sqlite");
  await db.run("DELETE FROM bills_arguments_votes WHERE comment_id=" + arg_id + " AND user_id=" + user_id);

  if(toggle == "false") {
    callback();
    return;
  }

  let query = "INSERT INTO bills_arguments_votes (comment_id, user_id) VALUES (?, ?)"

  var result = await db.all(query, [arg_id, user_id]);

  callback();
}

export async function UserVoteBill(callback, user_id, vote_id, for_against) {

  try{

    var db = await sqlite.open("./db.sqlite");
    await db.all("DELETE FROM bills_votes WHERE bill_id = ? AND user_id = ?", [vote_id, user_id]);
    let query = 'INSERT INTO bills_votes (bill_id, user_id, for_against) VALUES (?, ?, ?)'
    var result = await db.all(query, [vote_id, user_id, for_against]);

    callback();

  }catch(err) {
    console.log(err)
  }
}

export async function getCandidateData(callback) {

  let query = "SELECT * FROM candidates ORDER BY id ASC";
  var db = await sqlite.open("./db.sqlite");
  var result = await db.all(query);
  callback(result);
}

export async function getBills(callback) {

  let query = 'SELECT * FROM bills ORDER BY id ASC';

  try {

    var db = await sqlite.open("./db.sqlite");
    var result = await db.all(query);

    result.sort(function(a, b) {
        a = new Date(a.date);
        b = new Date(b.date);
        return a<b ? -1 : a>b ? 1 : 0;
    });

    for (var i = 0; i < result.length; i++) {

      let vote_count_query = 'SELECT COUNT(*) FROM bills_votes WHERE bill_id = ? AND for_against = ?';
      var vote_for_result = await db.all(vote_count_query, [result[i].id, 0]);
      var vote_against_result = await db.all(vote_count_query, [result[i].id, 1]);
      result[i].votes_for = vote_for_result[0]["COUNT(*)"];
      result[i].votes_against = vote_against_result[0]["COUNT(*)"];

    }

    callback(result);

  } catch(e) {
    callback(null);
    console.log(e);
  }

}

async function injectArgumentVote(db, argument_array, i, user_id) {

  let countQuery = 'SELECT COUNT(*) FROM bills_arguments_votes WHERE comment_id = ? AND user_id = ?'
  var countResult = await db.all(countQuery, [argument_array[i].id, user_id]);

  let actualQuery = 'SELECT COUNT(*) FROM bills_arguments_votes WHERE comment_id = ?'
  var actualResult = await db.all(actualQuery, [argument_array[i].id]);

  argument_array[i].voted_for = (countResult[0]["COUNT(*)"] > 0)
  argument_array[i].votes_for = actualResult[0]["COUNT(*)"]

}

export async function getBillData(callback, id, user_id) {

  try {

    var db = await sqlite.open("./db.sqlite");
    var result = await db.all(
      'SELECT * FROM bills WHERE id = ?', [id]
    );

    var bill = result[0];

    let did_vote_query = 'SELECT COUNT(*) FROM bills_votes WHERE bill_id = ? AND for_against = ? AND user_id = ?';

    var did_vote_for_result = await db.all(did_vote_query, [bill.id, 0, user_id]);
    var did_vote_against_result = await db.all(did_vote_query, [bill.id, 1, user_id]);

    let for_vote_count = did_vote_for_result[0]["COUNT(*)"];
    let against_vote_count = did_vote_against_result[0]["COUNT(*)"];

    if (for_vote_count > 1 || against_vote_count > 1 || for_vote_count + against_vote_count > 1) {
      console.log("User Voting Error: " + user_id);
      db.run("DELETE FROM bills_votes WHERE bill_id = ? AND user_id = ?", [bill.id, user_id]);
      console.log("Delete request made")
    }

    let vote_count_query = 'SELECT COUNT(*) FROM bills_votes WHERE bill_id = ? AND for_against = ?'

    var vote_for_result = await db.all(vote_count_query, [bill.id, 0]);
    var vote_against_result = await db.all(vote_count_query, [bill.id, 1]);

    bill.votes_for = vote_for_result[0]["COUNT(*)"];
    bill.votes_against = vote_against_result[0]["COUNT(*)"];

    bill.voted_for = (for_vote_count > 0);
    bill.voted_against = (against_vote_count > 0);

    //Get arguments for

    let arguments_query = 'SELECT * FROM bills_arguments WHERE bill_id = ? AND for_against = ?'

    let arguments_for = await db.all(arguments_query, [bill.id, 0]);
    let arguments_against = await db.all(arguments_query, [bill.id, 1]);

    for(var i = 0; i < arguments_for.length; i++) {
      await injectArgumentVote(db, arguments_for, i, user_id)
    }
    for(var i = 0; i < arguments_against.length; i++) {
      await injectArgumentVote(db, arguments_against, i, user_id)
    }

    bill.arguments_for = arguments_for;
    bill.arguments_against = arguments_against;

    callback(bill);

  } catch(e) {
    console.log(e);
    callback(null);
  }

}
