const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("티어")
    .setDescription("입력한 파일로 티어를 설정합니다.")
    //첨부파일 옵션 설정
    .addAttachmentOption((option) =>
      option
        .setName("input")
        .setRequired(true)
        .setDescription("csv파일을 첨부해주세요.")
    ),
  async execute(interaction) {
    const user = interaction.user;
    //첨부파일 가져오기
    const url = interaction.options.getAttachment("input").attachment;

    try {
      // //서버 멤버 목록 가져오기 (보류)
      // interaction.guild.members
      //   .fetch()
      //   .then((fetchedMembers) => console.log(fetchedMembers))
      //   .catch((error) => console.error(error));

      await interaction.reply(`파일을 읽고 있는 중...`);
      //외부url로 파일 페칭
      const response = await fetch(url);

      if (!response.ok)
        return await interaction.editReply(
          `파일 로딩 실패! : `,
          response.statusText
        );

      //응답 받아서 읽기 성공
      // 응답을 ArrayBuffer로 받고 EUC-KR로 디코딩
      const arrayBuffer = await response.arrayBuffer();
      const decoder = new TextDecoder("euc-kr");
      const csv = decoder.decode(arrayBuffer);

      // 각 줄로 분리 (빈 줄 제거)
      const lines = csv.split("\n").filter((line) => line.trim() !== "");

      // 첫 줄은 header로 사용: ['id', 'rank', 'game']
      const header = lines[0].split(",");

      // 데이터 행 파싱 (간단한 CSV 파싱: 쉼표 기준 분리)
      const data = lines.slice(1).map((line) => {
        const values = line.split(",");
        return {
          id: values[0].trim(),
          rank: Number(values[1].trim()),
          game: values[2] ? values[2].trim() : "",
        };
      });

      // game === "O" 인 사용자 필터링
      const gameOUsers = data.filter((item) => item.game === "O");

      // rank 오름차순 정렬
      gameOUsers.sort((a, b) => a.rank - b.rank);

      // 총 대상 사용자 수
      const total = gameOUsers.length;
      // 3등분 (전체가 3의 배수가 아닐 수 있으므로 Math.ceil 사용)
      const tierSize = Math.ceil(total / 3);

      const tierOne = gameOUsers.slice(0, tierSize);
      const tierTwo = gameOUsers.slice(tierSize, tierSize * 2);
      const tierThree = gameOUsers.slice(tierSize * 2);

      // 각 티어의 사용자 id 문자열 (쉼표로 구분)
      const tierOneStr = tierOne.map((user) => user.id).join(", ");
      const tierTwoStr = tierTwo.map((user) => user.id).join(", ");
      const tierThreeStr = tierThree.map((user) => user.id).join(", ");

      // 최종 결과 템플릿 문자열 작성
      const resultText = `>>> **:one:Tier**
${tierOneStr}

**:two:Tier**
${tierTwoStr}

**:three:Tier**
${tierThreeStr}`;

      await interaction.editReply(`${resultText}`);
    } catch (error) {
      console.log(error);
    }
  },
};
