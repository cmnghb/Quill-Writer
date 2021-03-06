module.exports =

function Lobby($firebase, firebaseUrl, Empirical, $analytics, _, $state) {
  var lobbyService = this;
  var lobbyRef = new Firebase(firebaseUrl + "/lobby");
  lobbyService.GROUP_SIZE = 2;

  lobbyService.getRoomRef = function(lobbyId) {
    return lobbyRef.child(String(lobbyId));
  };

  lobbyService.getRoom = function(roomRef) {
    return $firebase(roomRef);
  };

  lobbyService.getRoomMembers = function(roomRef) {
    var roomMembersRef = roomRef.child("members");
    var roomMembers = $firebase(roomMembersRef).$asArray();
    return roomMembers;
  };

  lobbyService.connectToLobby = function($scope, lobbyId) {
    var roomMembers = lobbyService.getRoomMembers(lobbyService.getRoomRef(lobbyId));
    $scope.members = roomMembers;
    return $scope;
  };

  lobbyService.addStudentToRoom = function(student, lobbyId) {
    var roomMembers = lobbyService.getRoomMembers(lobbyService.getRoomRef(lobbyId));
    roomMembers.$add(student);
    lobbyService.addStudentToGroup(student, lobbyId);
  };

  lobbyService.getGroupsRef = function(roomRef) {
    return roomRef.child("groups");
  };

  lobbyService.getGroups = function(roomRef) {
    return $firebase(lobbyService.getGroupsRef(roomRef)).$asArray();
  };

  /*
   * Each student in a group needs to know when their group is full. Full means
   * they can start game play. In addStudentToGroup, each student will be passed
   * to this function to register the watcher functions.
   */
  lobbyService.localGroupWatcher = function(groupId, student, lobbyId) {
    console.log("Registering with the local group watcher with %s %s %s", groupId, student, lobbyId);
    var groupsRef = lobbyService.getGroupsRef(lobbyService.getRoomRef(lobbyId));
    var groupRef = groupsRef.child(groupId);
    var group = $firebase(groupRef).$asObject();
    group.$watch(function() {
      if (group.full) {
        lobbyService.startGameFor($firebase(groupsRef), group, student, lobbyId);
      } else {
        console.log('Group %s not full yet!', groupId);
      }
    });
  };

  lobbyService.startGameFor = function(groups, group, student, lobbyId) {
    console.log("Starting game for %s %s %s", group.$id, student, lobbyId);
    $state.go('quill-writer.game', {
      uid: student.uuid,
      sid: group.$id,
      activityPrompt: group.activityPrompt
    });
    if (student.leader) {
      console.log('Student is the leader. Doing leader functions');
      groups.$remove(group.$id).then(function(ref) {
        console.log("Leader removed %s", ref.key());
      });
    }
  };

  /*
   * addStudentToGroup has a lot going on. The algorithm is attempting
   * to group students together. It checks to see if there are any slots
   * available. If there are, that student is in that group. If there
   * are no slots available, that student become the leader of the new group.
   * This has no effect on actual game play. When this group is ready to start,
   * the group leader's browser will run some extra code to clean up the firebase
   * objects.
   */
  lobbyService.addStudentToGroup = function(student, lobbyId) {
    var roomRef = lobbyService.getRoomRef(lobbyId);
    var groups = lobbyService.getGroups(roomRef);
    groups.$loaded().then(function(list) {
      var slotAvailable = _.findWhere(list, {full : false});
      if (slotAvailable) {
        slotAvailable.members.push(student);
        if (slotAvailable.members.length >= lobbyService.GROUP_SIZE) {
          slotAvailable.full = true;
        }
        lobbyService.localGroupWatcher(slotAvailable.$id, student, lobbyId);
        setTimeout(function() {
          groups.$save(slotAvailable);
        }, 200);
      } else {
        //need to make a new group with this student in it
        student.leader = true;
        groups.$add({
          members: [student],
          full: false,
          activityPrompt: lobbyId
        }).then(function(ref) {
          lobbyService.localGroupWatcher(ref.key(), student, lobbyId);
        });
      }
    });
  };
};
