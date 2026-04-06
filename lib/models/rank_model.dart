class RankUser {
  final String id;
  final String name;
  final String? photoUrl;

  RankUser({required this.id, required this.name, this.photoUrl});
}

class RankEntry {
  final int rank;
  final int xp;
  final List<RankUser> users;

  RankEntry({required this.rank, required this.xp, required this.users});
}